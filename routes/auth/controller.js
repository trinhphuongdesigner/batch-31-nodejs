const { generateToken } = require('../../helper/jwtHelper');
const { Customer } = require('../../models');

module.exports = {
  login: async (req, res, next) => {
    try {
      const {
        _id,
        firstName,
        lastName,
        phoneNumber,
        address,
        email,
        birthday,
        updatedAt,
      } = req.user
      const token = generateToken({
          _id,
          firstName,
          lastName,
          phoneNumber,
          address,
          email,
          birthday,
          updatedAt,
        });
      // const refreshToken = generateRefreshToken(employee._id);

      return res.status(200).json({
        token,
        // refreshToken,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  basicLogin: async (req, res, next) => {
    try {
      const user = await Customer.findById(req.user._id).select('-password').lean();
      const token = generateToken(user);
      // const refreshToken = generateRefreshToken(user._id);

      res.json({
        token,
        // refreshToken,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      res.sendStatus(400);
    }
  },

  getMe: async (req, res, next) => {
    try {
      res.status(200).json({
        message: "Layas thoong tin thanfh coong",
        payload: req.user,
      });
    } catch (err) {
      res.sendStatus(500);
    }
  },
};
