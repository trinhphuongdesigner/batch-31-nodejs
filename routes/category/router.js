var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const { getDetail, getList, search, create, update, softDelete } = require('./controller');
const checkIdSchema = require('../validation');
const { validationSchema } = require('./validation');

router.route('/:')
  .get(getList)
  .post(validateSchema(validationSchema), create)

router.get('/search', search);

router.route('/:id')
  .get(validateSchema(checkIdSchema), getDetail)
  .put(validateSchema(checkIdSchema), validateSchema(validationSchema), update)

router.patch('/delete/:id', softDelete);

module.exports = router;
