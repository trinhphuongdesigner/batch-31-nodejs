var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const { getDetail, getAll, search, create, update, updatePatch, hardDelete, softDelete } = require('./controller');
const checkIdSchema = require('../validation');
const { validationSchema } = require('./validation');


// /* GET LIST. */
// router.get('/', getAll);

// /* CREATE. */
// router.post('/', validateSchema(validationSchema), create);

router.route('/')
  .get(getAll)
  .post(validateSchema(validationSchema), create)

/* SEARCH LIST. */
router.get('/search', search);

// /* GET DETAIL. */
// router.get('/:id', validateSchema(checkIdSchema), getDetail);

// /* UPDATE - PUT. */
// router.put('/:id', validateSchema(validationProductUpdateSchema), update);

// /* UPDATE - PATCH. */
// router.patch('/:id', updatePatch);

/* DELETE - HARD. */
// router.delete('/:id', hardDelete);

router.route('/:id')
  .get(validateSchema(checkIdSchema), getDetail)
  .put(validateSchema(checkIdSchema), validateSchema(validationSchema), update)
  .patch(updatePatch)
  .delete(hardDelete)

/* DELETE - SOFT. */
router.patch('/delete/:id', softDelete);

module.exports = router;
