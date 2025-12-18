require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
// FIX: Using .default for compatibility with new connect-mongo versions
const MongoStore = require('connect-mongo'); 
const passport = require('passport');
const { Server } = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');

const { User, Repo, Chat, Bug } = require('./models/Schemas');
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gitvox')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/gitvox' 
  }),
  cookie: { secure: false, httpOnly: true, maxAge: 86400000 }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect(`${process.env.CLIENT_URL}/dashboard`)
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
    await User.findByIdAndUpdate(req.user._id, { profession: req.body.profession });
    res.json({ success: true });
});

// API Routes

// 1. Ingest Repo
app.post('/api/repo', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  
  // FIX: Robust URL Parsing
  const cleanUrl = req.body.url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  const parts = cleanUrl.split('/');
  const name = parts.pop();
  const repoOwner = parts.pop();

  if (!name || !repoOwner || repoOwner.includes('.')) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
  }

  try {
    let repo = await Repo.findOne({ url: cleanUrl });
    
    // FIX: Auto-Add user to allowed list if repo exists
    if (!repo) {
      repo = await Repo.create({
        url: cleanUrl,
        owner: req.user._id,
        name,
        repoOwner,
        allowedUsers: [req.user.username],
        lastSynced: new Date()
      });
    } else {
        if (!repo.allowedUsers.includes(req.user.username)) {
            repo.allowedUsers.push(req.user.username);
            await repo.save();
        }
    }
    
    const ghRes = await axios.get(`https://api.github.com/repos/${repoOwner}/${name}/commits`, {
      headers: { Authorization: `token ${req.user.accessToken}` }
    });

    res.json({ repo, commits: ghRes.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch repo" });
  }
});

// 2. Get Repo Data
app.get('/api/repo/:id', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo.allowedUsers.includes(req.user.username)) {
      return res.status(403).json({ error: "Access Denied" });
    }
    const ghRes = await axios.get(`https://api.github.com/repos/${repo.repoOwner}/${repo.name}/commits`, {
       headers: { Authorization: `token ${req.user.accessToken}` }
    });
    res.json({ repo, commits: ghRes.data });
  } catch (e) { res.status(500).json({ error: "Error" }); }
});

// 3. Add Collaborator
app.post('/api/repo/:id/collaborator', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  try {
    const repo = await Repo.findById(req.params.id);
    if (repo.owner.toString() !== req.user._id.toString()) 
      return res.status(403).json({ error: "Only owner can add" });
    
    if(!repo.allowedUsers.includes(req.body.username)){
      repo.allowedUsers.push(req.body.username);
      await repo.save();
    }
    res.json(repo);
  } catch(e) { res.status(500).send(e.message); }
});

// 4. Bugs & Chats
app.post('/api/bugs', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send();
  const bug = await Bug.create({ ...req.body, reporter: req.user._id });
  res.json(bug);
});

app.get('/api/chat/:hash', async (req, res) => {
  const chats = await Chat.find({ commitHash: req.params.hash })
                          .populate('sender', 'username avatarUrl profession')
                          .sort({ timestamp: 1 });
  res.json(chats);
});

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) next();
  else next(new Error('Unauthorized'));
});

io.on('connection', (socket) => {
  const user = socket.request.user;
  socket.on('join_commit', async ({ commitHash, repoId }) => {
    const repo = await Repo.findById(repoId);
    if (repo && repo.allowedUsers.includes(user.username)) socket.join(commitHash);
  });

  socket.on('send_message', async (data) => {
    const newChat = await Chat.create({
        commitHash: data.commitHash,
        repoId: data.repoId,
        sender: user._id,
        message: data.message
    });
    const populated = await Chat.findById(newChat._id).populate('sender', 'username avatarUrl profession');
    io.to(data.commitHash).emit('receive_message', populated);
  });
});

server.listen(5000, () => console.log(`🚀 Server running on port 5000`));