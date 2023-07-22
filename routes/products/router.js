var express = require('express');
var router = express.Router();

const { validateSchema } = require('../../helper')

const { getDetail, getList, search, create, update, updatePatch, hardDelete, softDelete } = require('./controller');
const { checkIdSchema, validationProductInfoSchema, validationProductUpdateSchema } = require('./validation');


// /* GET LIST. */
// router.get('/', getList);

// /* CREATE. */
// router.post('/', validateSchema(validationProductInfoSchema), create);

router.route('/:')
  .get(getList)
  .post(validateSchema(validationProductInfoSchema), create)

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
  .put(validateSchema(validationProductUpdateSchema), update)
  .patch(updatePatch)
  .delete(hardDelete)

/* DELETE - SOFT. */
router.patch('/delete/:id', softDelete);

module.exports = router;
