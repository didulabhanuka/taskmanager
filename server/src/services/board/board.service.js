const Board = require('../../models/Board');
const Column = require('../../models/Column');
const Card = require('../../models/Card');
const Activity = require('../../models/Activity');

// Get all boards where user is owner or member
const getBoards = async (userId) => {
  const boards = await Board.find({ members: userId })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });

  return boards;
};

// Get a single board with all its columns and cards
const getBoardById = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, members: userId })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!board) {
    const error = new Error('Board not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  // Get columns sorted by order
  const columns = await Column.find({ boardId }).sort({ order: 1 });

  // Get all cards for this board sorted by order
  const cards = await Card.find({ boardId })
    .populate('assignee', 'name email avatar')
    .sort({ order: 1 });

  return { board, columns, cards };
};

// Create a new board
const createBoard = async ({ title, description }, userId) => {
  const board = await Board.create({
    title,
    description,
    owner: userId,
    members: [userId],
  });

  await board.populate('owner', 'name email avatar');
  await board.populate('members', 'name email avatar');

  return board;
};

// Update board title or description — owner only
const updateBoard = async (boardId, updates, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) {
    const error = new Error('Board not found or not authorized');
    error.statusCode = 403;
    throw error;
  }

  const allowed = ['title', 'description'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) board[field] = updates[field];
  });

  await board.save();
  return board;
};

// Delete a board and all its columns, cards, activities — owner only
const deleteBoard = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) {
    const error = new Error('Board not found or not authorized');
    error.statusCode = 403;
    throw error;
  }

  await Card.deleteMany({ boardId });
  await Column.deleteMany({ boardId });
  await Activity.deleteMany({ boardId });
  await board.deleteOne();
};

// Add a member to a board by email — owner only
const addMember = async (boardId, email, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) {
    const error = new Error('Board not found or not authorized');
    error.statusCode = 403;
    throw error;
  }

  const User = require('../../models/User');
  const newMember = await User.findOne({ email });
  if (!newMember) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const alreadyMember = board.members.some(
    (memberId) => memberId.toString() === newMember._id.toString()
  );
  if (alreadyMember) {
    const error = new Error('User is already a member');
    error.statusCode = 400;
    throw error;
  }

  board.members.push(newMember._id);
  await board.save();
  await board.populate('members', 'name email avatar');

  return board;
};

// Remove a member from a board — owner only, cannot remove self
const removeMember = async (boardId, memberId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) {
    const error = new Error('Board not found or not authorized');
    error.statusCode = 403;
    throw error;
  }

  if (memberId.toString() === userId.toString()) {
    const error = new Error('Owner cannot remove themselves from the board');
    error.statusCode = 400;
    throw error;
  }

  board.members = board.members.filter(
    (id) => id.toString() !== memberId.toString()
  );

  await board.save();
  return board;
};

module.exports = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
};