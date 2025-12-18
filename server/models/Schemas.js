const mongoose = require('mongoose');

// --- USER SCHEMA ---
const UserSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  displayName: String,
  avatarUrl: String,
  profession: { type: String, default: 'Developer' },
  accessToken: String
});

// --- REPO SCHEMA ---
const RepoSchema = new mongoose.Schema({
  url: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  repoOwner: String,
  allowedUsers: [String], // Users who have ACCEPTED
  pendingUsers: [String], // Users who are INVITED but haven't accepted
  lastSynced: Date
});

// --- CHAT SCHEMA ---
const ChatSchema = new mongoose.Schema({
  commitHash: String,
  repoId: mongoose.Schema.Types.ObjectId,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// --- BUG SCHEMA ---
const BugSchema = new mongoose.Schema({
  repoId: mongoose.Schema.Types.ObjectId,
  commitHash: String,
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  severity: { type: String, enum: ['Low', 'Medium', 'Critical'] },
  status: { type: String, default: 'Open', enum: ['Open', 'Resolved'] }, // Added Status
  createdAt: { type: Date, default: Date.now }
});

// --- NOTIFICATION SCHEMA ---
const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['COLLAB_INVITE', 'BUG_REPORT', 'MENTION'] },
  message: String,
  link: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Repo: mongoose.model('Repo', RepoSchema),
  Chat: mongoose.model('Chat', ChatSchema),
  Bug: mongoose.model('Bug', BugSchema),
  Notification: mongoose.model('Notification', NotificationSchema)
};