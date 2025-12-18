const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  displayName: String,
  avatarUrl: String,
  profession: { type: String, default: 'Developer' },
  accessToken: String
});

const RepoSchema = new mongoose.Schema({
  url: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who ingested it
  name: String,
  repoOwner: String, // GitHub Owner
  allowedUsers: [String], // List of usernames allowed to access
  lastSynced: Date
});

const ChatSchema = new mongoose.Schema({
  commitHash: String,
  repoId: mongoose.Schema.Types.ObjectId,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const BugSchema = new mongoose.Schema({
  repoId: mongoose.Schema.Types.ObjectId,
  commitHash: String,
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  severity: { type: String, enum: ['Low', 'Medium', 'Critical'] },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Repo: mongoose.model('Repo', RepoSchema),
  Chat: mongoose.model('Chat', ChatSchema),
  Bug: mongoose.model('Bug', BugSchema)
};