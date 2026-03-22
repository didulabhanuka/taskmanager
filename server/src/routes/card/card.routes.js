const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth/auth.middleware');
const {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
} = require('../../controllers/card/card.controller');

router.use(protect);

router.post('/', createCard);
router.get('/:id', getCardById);
router.patch('/:id', updateCard);
router.delete('/:id', deleteCard);
router.patch('/:id/move', moveCard);

module.exports = router;