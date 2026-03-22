const Column = require('../../models/Column');
const Card = require('../../models/Card');
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

// Create a new column
const createColumn = async ({ title, boardId }, userId) => {
  await verifyBoardAccess(boardId, userId);

  // Get the highest order value and add 1
  const lastColumn = await Column.findOne({ boardId }).sort({ order: -1 });
  const order = lastColumn ? lastColumn.order + 1 : 0;

  const column = await Column.create({ title, boardId, order });
  return column;
};

// Update column title
const updateColumn = async (columnId, { title }, userId) => {
  const column = await Column.findById(columnId);
  if (!column) {
    const error = new Error('Column not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(column.boardId, userId);

  column.title = title;
  await column.save();
  return column;
};

// Delete a column and all its cards
const deleteColumn = async (columnId, userId) => {
  const column = await Column.findById(columnId);
  if (!column) {
    const error = new Error('Column not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(column.boardId, userId);

  await Card.deleteMany({ columnId });
  await column.deleteOne();
};

// Reorder columns — accepts an array of { _id, order } objects
const reorderColumns = async (boardId, columns, userId) => {
  await verifyBoardAccess(boardId, userId);

  const bulkOps = columns.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id, boardId },
      update: { order },
    },
  }));

  await Column.bulkWrite(bulkOps);
};

// Get a single column with its cards
const getColumnById = async (columnId, userId) => {
  const column = await Column.findById(columnId);
  if (!column) {
    const error = new Error('Column not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(column.boardId, userId);

  const cards = await Card.find({ columnId }).sort({ order: 1 });
  return { column, cards };
};

module.exports = {
  getColumnById,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};