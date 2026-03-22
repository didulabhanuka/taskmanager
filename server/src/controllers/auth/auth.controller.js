const authService = require('../../services/auth/auth.service');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ status: 'success', token, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.status(200).json({ status: 'success', token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };