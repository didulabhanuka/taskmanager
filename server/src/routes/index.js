const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth.routes'));
router.use('/boards', require('./board/board.routes'));

// Add more routers here as we build them
// router.use('/boards', require('./boards/boards.routes'));
// router.use('/columns', require('./columns/columns.routes'));
// router.use('/cards', require('./cards/cards.routes'));
// router.use('/activities', require('./activities/activities.routes'));

module.exports = router;