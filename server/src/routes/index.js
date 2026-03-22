const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth.routes'));
router.use('/boards', require('./board/board.routes'));
router.use('/columns', require('./column/column.routes'));
router.use('/cards', require('./card/card.routes'));
router.use('/activities', require('./activity/activity.routes'));

module.exports = router;