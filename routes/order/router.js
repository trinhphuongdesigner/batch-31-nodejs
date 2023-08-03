const express = require('express');
const router = express.Router();

const { validateSchema } = require('../../helper');
const {
  getDetailSchema,
  createSchema,
  updateSchema,
} = require('./validations');
const {
  getAll,
  getDetail,
  create,
  remove,
  update,
} = require('./controller');

router.route('/')
  .get(getAll)
  .post(validateSchema(createSchema), create)

router.route('/:id')
  .get(validateSchema(getDetailSchema), getDetail)
  .patch(validateSchema(updateSchema), update)
  .delete(validateSchema(getDetailSchema), remove)

module.exports = router;
