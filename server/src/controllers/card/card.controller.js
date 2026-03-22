const cardService = require('../../services/card/card.service');

const getCardById = async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.params.id, req.user._id);
    res.status(200).json({ status: 'success', data: card });
  } catch (err) {
    next(err);
  }
};

const createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard(req.body, req.user._id);
    res.status(201).json({ status: 'success', data: card });
  } catch (err) {
    next(err);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const card = await cardService.updateCard(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: card });
  } catch (err) {
    next(err);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    await cardService.deleteCard(req.params.id, req.user._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const moveCard = async (req, res, next) => {
  try {
    const result = await cardService.moveCard(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
};