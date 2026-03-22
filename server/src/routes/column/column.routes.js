const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth/auth.middleware');
const {
  getColumnById,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = require('../../controllers/column/column.controller');

router.use(protect);

router.post('/', createColumn);
router.patch('/reorder', reorderColumns);
router.patch('/:id', updateColumn);
router.delete('/:id', deleteColumn);
router.get('/:id', getColumnById);

module.exports = router;