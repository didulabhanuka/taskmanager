const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth/auth.middleware');
const {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} = require('../../controllers/board/board.controller');

// All board routes require authentication
router.use(protect);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.patch('/:id', updateBoard);
router.delete('/:id', deleteBoard);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;