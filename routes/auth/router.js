const express = require('express');
const passport = require('passport');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
  loginSchema,
} = require('./validations');
const {
  login,
} = require('./controller');

router.route('/login')
  .post(
    validateSchema(loginSchema),
    passport.authenticate('local', { session: false }),
    login,
  )

module.exports = router;
