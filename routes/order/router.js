const express = require('express');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
  getDetailSchema,
  createSchema,
  updateSchema,
  updateStatusSchema,
} = require('./validations');
const {
  getAll,
  getDetail,
  create,
  updateStatus,
  update,
} = require('./controller');

router.route('/')
  .get(getAll)
  .post(validateSchema(createSchema), create)

router.route('/:id')
  .get(validateSchema(getDetailSchema), getDetail)
  .patch(validateSchema(updateSchema), update)

router.route('/status/:id')
  .patch(validateSchema(updateStatusSchema), updateStatus)

module.exports = router;
