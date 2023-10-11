const JWT = require('jsonwebtoken');

const { generateToken, generateRefreshToken } = require('../../helper/jwtHelper');
const { Customer, Cart } = require('../../models');
const jwtSettings = require('../../constants/jwtSetting');

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
      const refreshToken = generateRefreshToken(_id);

      return res.status(200).json({
        token,
        refreshToken,
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  
  register: async function (req, res, next) {
    try {
      const data = req.body;

      const { email, phoneNumber } = data;

      const getEmailExits = Customer.findOne({ email });
      const getPhoneExits = Customer.findOne({ phoneNumber });

      const [foundEmail, foundPhoneNumber] = await Promise.all([getEmailExits, getPhoneExits]);

      const errors = [];
      if (foundEmail) errors.push('Email đã tồn tại');
      // if (!isEmpty(foundEmail)) errors.push('Email đã tồn tại');
      if (foundPhoneNumber) errors.push('Số điện thoại đã tồn tại');

      if (errors.length > 0) {
        return res.status(404).json({
          code: 404,
          message: "Không thành công",
          errors,
        });
      }

      const newItem = new Customer(data);
  
      let result = await newItem.save();
      customerId = result._id;

      const newCart = new Cart({ customerId });
      newCart.save();

      // Đã tạo tài khoản thành công
  
      return res.send({ code: 200, message: 'Tạo thành công', payload: result });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },

  checkRefreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      JWT.verify(refreshToken, jwtSettings.SECRET, async (err, data) => {
        if (err) {
          return res.status(401).json({
            message: 'refreshToken is invalid',
          });
        } else {
          const { id } = data;

          const customer = await Customer.findOne({
            _id: id,
            isDeleted: false,
          }).select('-password').lean();

          if (customer) {
            const {
              _id,
              firstName,
              lastName,
              phoneNumber,
              address,
              email,
              birthday,
              updatedAt,
            } = customer;

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

            return res.status(200).json({ token });
          }
          return res.sendStatus(401);
        }
      });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      res.status(400).json({
        statusCode: 400,
        message: 'Lỗi',
      });
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
