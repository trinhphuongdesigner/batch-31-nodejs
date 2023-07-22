var express = require('express');
const fs = require('fs');
var router = express.Router();
const yup = require('yup');

let products = require('../data/products.json');

const writeFileSync = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data), function (err) {
    if (err) {

      throw err
    };
    console.log('Saved!');
  });
};

const combineObjects = (obj1, obj2) => {
  const combinedObj = {};

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key) && typeof obj1[key] !== "undefined") {
      combinedObj[key] = obj1[key];
    }
  }

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && typeof obj2[key] !== "undefined") {
      combinedObj[key] = obj2[key];
    }
  }

  return combinedObj;
};

const fuzzySearch = (text) => {
  const regex = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  return new RegExp(regex, 'gi');
};

// module.exports = fuzzySearch;


const generationID = () => Math.floor(Date.now());

const validateSchema = (schema) => async (req, res, next) => { // thực thi việc xác thực
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    },
    {
      abortEarly: false,
    });
    return next();
  } catch (err) {
    return res.status(400).json({ type: err.name, errors: err.errors, provider: "YUP" });
  }
};

const checkIdSchema = yup.object({ // BỘ LỌC RIÊNG CHO TỪNG TRƯỜNG HỢP
  params: yup.object({
    id: yup.number(),
  }),
});

const validationProductInfoSchema = yup.object().shape({
  body: yup.object({
    name: yup.string().max(50, "Tên sản phẩm quá dài").required("Tên không được bỏ trống"),
    price: yup.number().min(0, "Giá không thể âm").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    discount: yup.number().min(0, "Giảm giá không thể âm").max(75, "Giảm giá quá lớn").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    stock: yup.number().min(0, "Số lượng không hợp lệ").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    description: yup.string().max(3000, "Mô tả quá dài").required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    isDeleted: yup.boolean().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
  }),
});

/* GET LIST. */
router.get('/', function (req, res, next) {
  res.send(200, {
    message: "Thành công",
    payload: products.filter((item) => !item.isDeleted),
  });
});

/* SEARCH LIST. */
router.get('/search', function (req, res, next) {
  const { name } = req.query;
  let productFilter = [];

  if (name) {
    const searchRex = fuzzySearch(name);

    productFilter = products.filter((item) => {
      if (!item.isDeleted && searchRex.test(item.name)) {
        return item;
      }
    })
  } else {
    productFilter = products.filter((item) => !item.isDeleted);
  }

  res.send(200, {
    message: "Thành công",
    payload: productFilter,
  });
});

function getDetail (req, res, next) {
  const { id } = req.params;
  const product = products.find((item) => item.id.toString() === id.toString());

  if (product) {
    if (product.isDeleted) {
      return res.send(400, {
        message: "Sản phẩm đã bị xóa",
      });
    }

    return res.send(200, {
      message: "Thành công",
      payload: product,
    });
  }

  return res.send(404, {
    message: "Không tìm thấy",
  })
}

/* GET DETAIL. */
router.get('/:id', validateSchema(checkIdSchema), getDetail);
// router.get('/:id', function (req, res, next) {
//   const validationGetProductDetailSchema = yup.object().shape({
//     params: yup.object({
//       id: yup.number(),
//     }),
//   });

//   validationGetProductDetailSchema
//     .validate({ params: req.params }, { abortEarly: false })
//     .then(() => {
//       const { id } = req.params;
//       const product = products.find((item) => item.id.toString() === id.toString());

//       if (product) {
//         if (product.isDeleted) {
//           return res.send(400, {
//             message: "Sản phẩm đã bị xóa",
//           });
//         }

//         return res.send(200, {
//           message: "Thành công",
//           payload: product,
//         });
//       }

//       return res.send(404, {
//         message: "Không tìm thấy",
//       })
//     })
//     .catch((err) => {
//       return res.status(400).json({ type: "Xác thực thất bại", errors: err.errors, provider: 'yup' });
//     });
// });

// router.get('/:id', function (req, res, next) {
//   const validationGetProductDetailSchema = yup.object().shape({
//     id: yup.number(),
//   });

//   validationGetProductDetailSchema
//     .validate({ id: req.params.id }, { abortEarly: false })
//     .then(() => {
//       const { id } = req.params;
//       const product = products.find((item) => item.id.toString() === id.toString());

//       if (product) {
//         if (product.isDeleted) {
//           return res.send(400, {
//             message: "Sản phẩm đã bị xóa",
//           });
//         }

//         return res.send(200, {
//           message: "Thành công",
//           payload: product,
//         });
//       }

//       return res.send(404, {
//         message: "Không tìm thấy",
//       })
//     })
//     .catch((err) => {
//       console.log('««««« err »»»»»', err);
//       return res.status(400).json({ type: "Xác thực thất bại", errors: err.errors, provider: 'yup' });
//     });
// });

/* CREATE. */
router.post('/', validateSchema(validationProductInfoSchema), function (req, res, next) {
  const { name, price, discount, stock, description, isDeleted } = req.body;
  const newProductList = [
    ...products,
    { id: generationID(), name, price, discount, stock, description, isDeleted }
  ];

  writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công",
    // payload: products,
  });
});

/* UPDATE - PUT. */
router.put('/:id', async function (req, res, next) {
  const validationSchema = yup.object().shape({
    body: yup.object({
      name: yup.string().max(50, "Tên sản phẩm quá dài").required("Tên không được bỏ trống"),
      price: yup.number().min(0, "Giá không thể âm").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
      discount: yup.number().min(0, "Giảm giá không thể âm").max(75, "Giảm giá quá lớn").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
      stock: yup.number().min(0, "Số lượng không hợp lệ").integer().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
      description: yup.string().max(3000, "Mô tả quá dài").required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
      isDeleted: yup.boolean().required(({ path }) => `${path.split(".")[1]} không được bỏ trống`),
    }),
    params: yup.object({
      id: yup.number(),
    })
  });

  validationSchema
    .validate({ params: req.params, body: req.body }, { abortEarly: false })
    .then(() => {
      const { id } = req.params;
      const { name, price, description, discount, stock, isDeleted } = req.body; // case 1

      // const product = products.find((item) => item.id.toString() === id.toString());

      // if (product.isDeleted) {
      //   return res.send(400, {
      //     message: "Sản phẩm đã bị xóa",
      //   });
      // }

      const updateData = {
        id,
        name,
        price,
        description,
        discount,
        stock,
        isDeleted,
      };

      let isErr = false;

      const newProductList = products.map((item) => {
        if (item.id.toString() === id.toString()) {
          if (item.isDeleted) {
            isErr = true;
            return item;
          } else {
            return updateData;
          }
        }

        return item;
      })

      if (!isErr) {
        writeFileSync('./data/products.json', newProductList);

        return res.send(200, {
          message: "Thành công",
          payload: updateData,
        });
      }
      return res.send(400, {
        message: "Cập nhật không thành công",
      });
    })
    .catch((err) => {
      return res.status(400).json({ type: "Xác thực thất bại", errors: err.errors, provider: 'yup' });
    });
});

/* UPDATE - PATCH. */
router.patch('/:id', async function (req, res, next) {
  const { id } = req.params;
  const { name, price, description, discount } = req.body; // case 1

  let updateData = {};
  let isErr = false;

  const newProductList = products.map((item) => {
    if (item.id.toString() === id.toString()) {
      if (item.isDeleted) {
        isErr = true;
        return item;
      } else {
        updateData = combineObjects(item, { name, price, description, discount });

        return updateData;
      }
    }

    return item;
  })

  if (!isErr) {
    await writeFileSync('./data/products.json', newProductList);

    return res.send(200, {
      message: "Thành công",
      payload: updateData,
    });
  }
  return res.send(400, {
    message: "Cập nhật không thành công",
  });
});

/* DELETE - SOFT. */
router.patch('/delete/:id', async function (req, res, next) {
  const { id } = req.params;

  const newProductList = products.map((item) => {
    if (item.id.toString() === id.toString()) {
      return {
        ...item,
        isDeleted: true,
      };
    };

    return item;
  })

  await writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công xóa",
  });
});

/* DELETE - HARD. */
router.delete('/:id', async function (req, res, next) {
  const { id } = req.params;

  const newProductList = products.filter((item) => item.id.toString() !== id.toString());

  await writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công xóa",
  });
});

module.exports = router;
