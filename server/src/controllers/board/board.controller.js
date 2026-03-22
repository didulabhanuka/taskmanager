const boardService = require('../../services/board/board.service');

const getBoards = async (req, res, next) => {
  try {
    const boards = await boardService.getBoards(req.user._id);
    res.status(200).json({ status: 'success', data: boards });
  } catch (err) {
    next(err);
  }
};

const getBoardById = async (req, res, next) => {
  try {
    const data = await boardService.getBoardById(req.params.id, req.user._id);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const createBoard = async (req, res, next) => {
  try {
    const board = await boardService.createBoard(req.body, req.user._id);
    res.status(201).json({ status: 'success', data: board });
  } catch (err) {
    next(err);
  }
};

const updateBoard = async (req, res, next) => {
  try {
    const board = await boardService.updateBoard(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: board });
  } catch (err) {
    next(err);
  }
};

const deleteBoard = async (req, res, next) => {
  try {
    await boardService.deleteBoard(req.params.id, req.user._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const board = await boardService.addMember(
      req.params.id,
      req.body.email,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: board });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const board = await boardService.removeMember(
      req.params.id,
      req.params.memberId,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: board });
  } catch (err) {
    next(err);
  }
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