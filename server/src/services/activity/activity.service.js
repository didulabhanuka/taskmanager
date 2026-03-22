const Activity = require('../../models/Activity');
const Board = require('../../models/Board');

// Check if user is a member of the board
const verifyBoardAccess = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, members: userId });
  if (!board) {
    const error = new Error('Board not found or access denied');
    error.statusCode = 404;
    throw error;
  }
  return board;
};

// Get paginated activities for a board
const getActivities = async (boardId, userId, { limit = 50, skip = 0 }) => {
  await verifyBoardAccess(boardId, userId);

  const activities = await Activity.find({ boardId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit));

  const total = await Activity.countDocuments({ boardId });

  return { activities, total };
};

module.exports = { getActivities };