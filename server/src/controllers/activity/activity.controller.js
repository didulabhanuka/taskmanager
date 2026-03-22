const activityService = require('../../services/activity/activity.service');

const getActivities = async (req, res, next) => {
  try {
    const { limit, skip } = req.query;
    const data = await activityService.getActivities(
      req.params.boardId,
      req.user._id,
      { limit, skip }
    );
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivities };