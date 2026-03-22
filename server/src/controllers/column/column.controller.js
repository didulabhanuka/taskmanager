const columnService = require('../../services/column/column.service');

const createColumn = async (req, res, next) => {
  try {
    const column = await columnService.createColumn(req.body, req.user._id);
    res.status(201).json({ status: 'success', data: column });
  } catch (err) {
    next(err);
  }
};

const updateColumn = async (req, res, next) => {
  try {
    const column = await columnService.updateColumn(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: column });
  } catch (err) {
    next(err);
  }
};

const deleteColumn = async (req, res, next) => {
  try {
    await columnService.deleteColumn(req.params.id, req.user._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const reorderColumns = async (req, res, next) => {
  try {
    await columnService.reorderColumns(
      req.body.boardId,
      req.body.columns,
      req.user._id
    );
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

const getColumnById = async (req, res, next) => {
  try {
    const data = await columnService.getColumnById(req.params.id, req.user._id);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getColumnById,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
};