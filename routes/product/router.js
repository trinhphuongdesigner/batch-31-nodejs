var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const { getDetail, getAll, search, create, update, updatePatch, hardDelete, softDelete } = require('./controller');
const checkIdSchema = require('../validation');
const { validationSchema, validationQuerySchema } = require('./validation');

router.route('/')
  .get(getAll)
  .post(validateSchema(validationSchema), create)

router.get('/search', validateSchema(validationQuerySchema), search);

router.route('/:id')
  .get(validateSchema(checkIdSchema), getDetail)
  .put(validateSchema(checkIdSchema), validateSchema(validationSchema), update)

router.patch('/delete/:id', softDelete);

module.exports = router;
