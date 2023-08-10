
const { Customer } = require('../../models');

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // phuongtd1@gmail.com
      // 123456

      const userInfo = await Customer.findOne({
        isDeleted: false,
        email,
      });

      if (!userInfo) {
        return res.send({ code: 404, message: "Tài khoản không tồn tại hoặc bị xóa" });
      }

      const isCorrectPass = await userInfo.isValidPass(password);

      if (isCorrectPass) {
        return res.send({ code: 200, payload: userInfo, message: "Đăng nhập thành công" });
      }

      return res.send({ code: 400, message: "Tài khoản hoặc mật khẩu không đúng" });
    } catch (err) {
      console.log('««««« err »»»»»', err);
      return res.status(500).json({ code: 500, error: err });
    }
  },
};
