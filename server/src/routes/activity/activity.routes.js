const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth/auth.middleware');
const { getActivities } = require('../../controllers/activity/activity.controller');

router.use(protect);

// GET /api/activities/:boardId?limit=50&skip=0
router.get('/:boardId', getActivities);

module.exports = router;