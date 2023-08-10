const express = require('express');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
  loginSchema,
} = require('./validations');
const {
  login,
} = require('./controller');

router.route('/login')
  .post(validateSchema(loginSchema), login)

module.exports = router;
