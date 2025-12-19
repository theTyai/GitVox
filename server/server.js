require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { Server } = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');

const { User, Repo, Chat, Bug, Notification } = require('./models/Schemas');
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------
// 👇 CRITICAL: Trust Render's Proxy (Fixes 401 Auth Error)
app.set('trust proxy', 1);
// ---------------------------------------------------------

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gitvox')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MIDDLEWARE ---
app.use(cors({ 
    // Allow Vercel Frontend OR Localhost
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// --- SESSION ---
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/gitvox',
    collectionName: 'sessions' 
  }),
  cookie: { 
      // Secure MUST be true on Render (HTTPS)
      secure: process.env.NODE_ENV === 'production', 
      // SameSite 'none' allows cookies cross-domain (Vercel -> Render)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000 
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// --- AUTH ROUTES ---
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`)
);

app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) res.json(req.user);
  else res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

app.post('/api/user/update', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(401).send();
    const { profession, displayName } = req.body;
    await User.findByIdAndUpdate(req.user._id, { profession, displayName });
    res.json({ success: true });
});

app.get('/api/user/profile/:username', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
        const user = await User.findOne({ username: req.params.username }).select('username displayName avatarUrl profession githubId');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// --- REPO ROUTES ---

app.get('/api/github/my-repos', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const ghRes = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
      headers: { Authorization: `token ${req.user.accessToken}` }
    });
    const repos = ghRes.data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      private: r.private,
      permissions: r.permissions,
      updated_at: r.updated_at
    }));
    res.json(repos);
  } catch (err) { res.status(500).json({ error: "Failed to fetch GitHub repos" }); }
});

app.get('/api/repos', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const repos = await Repo.find({ allowedUsers: req.user.username }).sort({ lastSynced: -1 });
    res.json(repos);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/repo', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  
  const { url, inviteUser } = req.body;
  const cleanUrl = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  const parts = cleanUrl.split('/');
  const name = parts.pop();
  const repoOwner = parts.pop();

  if (!name || !repoOwner) return res.status(400).json({ error: "Invalid GitHub URL" });

  try {
    const repoDetails = await axios.get(`https://api.github.com/repos/${repoOwner}/${name}`, {
      headers: { Authorization: `token ${req.user.accessToken}` }
    });
    const perms = repoDetails.data.permissions;

    if (!perms || (!perms.admin && !perms.push)) {
      return res.status(403).json({ error: "Access Denied: Write access required." });
    }

    let repo = await Repo.findOne({ url: cleanUrl });
    if (!repo) {
      repo = await Repo.create({
        url: cleanUrl,
        owner: req.user._id,
        name,
        repoOwner,
        allowedUsers: [req.user.username],
        pendingUsers: [],
        lastSynced: new Date()
      });
    } else {
        if (!repo.allowedUsers.includes(req.user.username)) {
            repo.allowedUsers.push(req.user.username);
            await repo.save();
        }
    }

    if (inviteUser && !repo.allowedUsers.includes(inviteUser) && !repo.pendingUsers.includes(inviteUser)) {
        repo.pendingUsers.push(inviteUser);
        await repo.save();
        const friend = await User.findOne({ username: inviteUser });
        if (friend) {
            await Notification.create({
                recipient: friend._id,
                type: 'COLLAB_INVITE',
                message: `${req.user.username} invited you to ${repo.name}`,
                link: `/repo/${repo._id}`
            });
        }
    }
    
    const ghRes = await axios.get(`https://api.github.com/repos/${repoOwner}/${name}/commits`, {
      headers: { Authorization: `token ${req.user.accessToken}` }
    });

    res.json({ repo, commits: ghRes.data });
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: "Repo not found or private." });
    res.status(500).json({ error: "Ingestion Failed" });
  }
});

app.get('/api/repo/:id', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo.allowedUsers.includes(req.user.username) && !repo.pendingUsers.includes(req.user.username)) {
      return res.status(403).json({ error: "Access Denied" });
    }
    const ghRes = await axios.get(`https://api.github.com/repos/${repo.repoOwner}/${repo.name}/commits`, {
       headers: { Authorization: `token ${req.user.accessToken}` }
    });
    res.json({ repo, commits: ghRes.data });
  } catch (e) { res.status(500).json({ error: "Error fetching repo" }); }
});

// --- GLOBAL ACTIVITY FEED ---
app.get('/api/repo/:id/global-activity', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
        const chats = await Chat.find({ repoId: req.params.id }).sort({ timestamp: -1 }).limit(20).populate('sender', 'username avatarUrl');
        const bugs = await Bug.find({ repoId: req.params.id }).sort({ createdAt: -1 }).limit(20).populate('reporter', 'username avatarUrl');
        
        const combined = [
            ...chats.map(c => ({ type: 'CHAT', data: c, date: c.timestamp })),
            ...bugs.map(b => ({ type: 'BUG', data: b, date: b.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(combined);
    } catch(e) { res.status(500).send("Error"); }
});

app.get('/api/activity/feed', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const userRepos = await Repo.find({ allowedUsers: req.user.username });
      const repoIds = userRepos.map(r => r._id);
      
      const chats = await Chat.find({ repoId: { $in: repoIds } }).sort({ timestamp: -1 }).limit(10).populate('sender', 'username').lean();
      const bugs = await Bug.find({ repoId: { $in: repoIds } }).sort({ createdAt: -1 }).limit(5).populate('reporter', 'username').lean();
      
      const feed = [
          ...chats.map(c => ({ type: 'CHAT', user: c.sender.username, message: c.message, date: c.timestamp, repoName: userRepos.find(r => r._id.equals(c.repoId))?.name, hash: c.commitHash, link: `/repo/${c.repoId}` })),
          ...bugs.map(b => ({ type: 'BUG', user: b.reporter.username, message: `[BUG] ${b.description.substring(0,30)}`, date: b.createdAt, repoName: userRepos.find(r => r._id.equals(b.repoId))?.name, hash: b.commitHash, link: `/repo/${b.repoId}` }))
      ];
      feed.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json(feed.slice(0, 15));
    } catch(e) { res.status(500).json([]); }
});

// --- TEAM & INVITES ---
app.post('/api/repo/:id/collaborator', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const { username } = req.body;
    const repo = await Repo.findById(req.params.id);

    if (repo.owner.toString() !== req.user._id.toString()) 
      return res.status(403).json({ error: "Only owner can add collaborators" });

    if (repo.allowedUsers.includes(username) || repo.pendingUsers.includes(username)) {
        return res.status(400).json({ error: "User already added or pending" });
    }

    repo.pendingUsers.push(username);
    await repo.save();

    const friend = await User.findOne({ username });
    if (friend) {
      await Notification.create({
        recipient: friend._id,
        type: 'COLLAB_INVITE',
        message: `${req.user.username} invited you to ${repo.name}`,
        link: `/repo/${repo._id}`
      });
    }
    res.json(repo);
  } catch(e) { res.status(500).send(e.message); }
});

app.delete('/api/repo/:id/collaborator', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const { username } = req.body;
    const repo = await Repo.findById(req.params.id);
    
    if (repo.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Only owner can remove." });
    if (username === req.user.username) return res.status(400).json({ error: "Cannot remove self." });

    repo.allowedUsers = repo.allowedUsers.filter(u => u !== username);
    repo.pendingUsers = repo.pendingUsers.filter(u => u !== username);
    await repo.save();
    res.json(repo);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/repo/:id/accept', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const repo = await Repo.findById(req.params.id);
    if (repo.pendingUsers.includes(req.user.username)) {
        repo.pendingUsers = repo.pendingUsers.filter(u => u !== req.user.username);
        repo.allowedUsers.push(req.user.username);
        await repo.save();
        res.json({ success: true, repo });
    } else {
        res.status(400).json({ error: "No pending invite found" });
    }
});

// --- BUGS & NOTIFICATIONS ---
app.post('/api/bugs', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  const bug = await Bug.create({ ...req.body, reporter: req.user._id });
  res.json(bug);
});

app.post('/api/bug/:id/toggle', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
        const bug = await Bug.findById(req.params.id);
        bug.status = bug.status === 'Open' ? 'Resolved' : 'Open';
        await bug.save();
        res.json(bug);
    } catch(e) { res.status(500).send("Error"); }
});

app.get('/api/notifications', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  const notes = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json(notes);
});

app.post('/api/notifications/mark-read', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});

// --- SOCKET.IO ---
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true } });
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use((socket, next) => (socket.request.user ? next() : next(new Error('Unauthorized'))));

io.on('connection', (socket) => {
  const user = socket.request.user;
  socket.on('join_commit', async ({ commitHash, repoId }) => {
    const repo = await Repo.findById(repoId);
    if (repo && (repo.allowedUsers.includes(user.username) || repo.pendingUsers.includes(user.username))) {
        socket.join(commitHash);
    }
  });
  socket.on('send_message', async (data) => {
    const newChat = await Chat.create({ commitHash: data.commitHash, repoId: data.repoId, sender: user._id, message: data.message });
    const populated = await Chat.findById(newChat._id).populate('sender', 'username avatarUrl profession');
    io.to(data.commitHash).emit('receive_message', populated);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));