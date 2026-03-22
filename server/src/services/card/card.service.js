const Card = require('../../models/Card');
const Column = require('../../models/Column');
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

// Get a single card
const getCardById = async (cardId, userId) => {
  const card = await Card.findById(cardId).populate('assignee', 'name email avatar');
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(card.boardId, userId);
  return card;
};

// Create a new card
const createCard = async ({ title, description, columnId, boardId }, userId) => {
  await verifyBoardAccess(boardId, userId);

  // Verify column exists and belongs to this board
  const column = await Column.findOne({ _id: columnId, boardId });
  if (!column) {
    const error = new Error('Column not found');
    error.statusCode = 404;
    throw error;
  }

  // Get the highest order value in this column and add 1
  const lastCard = await Card.findOne({ columnId }).sort({ order: -1 });
  const order = lastCard ? lastCard.order + 1 : 0;

  const card = await Card.create({
    title,
    description,
    columnId,
    boardId,
    order,
  });

  // Log activity
  await Activity.create({
    boardId,
    userId,
    action: 'card.created',
    meta: { cardTitle: card.title, columnTitle: column.title },
  });

  return card;
};

// Update card details
const updateCard = async (cardId, updates, userId) => {
  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(card.boardId, userId);

  const allowed = ['title', 'description', 'assignee', 'dueDate', 'labels'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) card[field] = updates[field];
  });

  await card.save();
  await card.populate('assignee', 'name email avatar');

  // Log activity
  await Activity.create({
    boardId: card.boardId,
    userId,
    action: 'card.updated',
    meta: { cardTitle: card.title },
  });

  return card;
};

// Delete a card
const deleteCard = async (cardId, userId) => {
  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(card.boardId, userId);

  // Log activity before deleting
  await Activity.create({
    boardId: card.boardId,
    userId,
    action: 'card.deleted',
    meta: { cardTitle: card.title },
  });

  await card.deleteOne();
};

// Move a card to a different column or position
const moveCard = async (cardId, { toColumnId, newOrder }, userId) => {
  const card = await Card.findById(cardId);
  if (!card) {
    const error = new Error('Card not found');
    error.statusCode = 404;
    throw error;
  }

  await verifyBoardAccess(card.boardId, userId);

  const fromColumnId = card.columnId.toString();

  // Get column titles for activity log
  const [fromColumn, toColumn] = await Promise.all([
    Column.findById(fromColumnId),
    Column.findById(toColumnId),
  ]);

  // Reorder cards in the destination column using bulkWrite
  // First shift all cards at or above newOrder up by 1
  await Card.updateMany(
    { columnId: toColumnId, order: { $gte: newOrder }, _id: { $ne: cardId } },
    { $inc: { order: 1 } }
  );

  card.columnId = toColumnId;
  card.order = newOrder;
  await card.save();

  // Log activity
  await Activity.create({
    boardId: card.boardId,
    userId,
    action: 'card.moved',
    meta: {
      cardTitle: card.title,
      fromColumnTitle: fromColumn?.title,
      toColumnTitle: toColumn?.title,
      fromColumnId,
      toColumnId,
    },
  });

  await card.populate('assignee', 'name email avatar');
  return { card, fromColumnId, toColumnId };
};

module.exports = {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
};