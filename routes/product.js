var express = require('express');
const fs = require('fs');
var router = express.Router();

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
}


const generationID = () => Math.floor(Date.now());

/* GET LIST. */
router.get('/', function (req, res, next) {
  res.send(200, {
    message: "Thành công",
    payload: products.filter((item) => !item.isDeleted),
  });
});

/* GET DETAIL. */
router.get('/:id', function (req, res, next) {
  const { id } = req.params;
  const product = products.find((item) => item.id.toString() === id.toString());

  if (product.isDeleted) {
    return res.send(400, {
      message: "Sản phẩm đã bị xóa",
    });
  }

  if (product) {
    return res.send(200, {
      message: "Thành công",
      payload: product,
    });
  }

  return res.send(404, {
    message: "Không tìm thấy",
  })
});

/* CREATE. */
router.post('/', function (req, res, next) {
  const { name, price } = req.body;
  const newProductList = [
    ...products,
    { name, price, id: generationID(), isDeleted: false }
  ];

  writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công",
    // payload: products,
  });
});

/* UPDATE - PUT. */
router.put('/:id', async function (req, res, next) {
  const { id } = req.params;
  const { name, price, description, discount } = req.body; // case 1

  const updateData = {
    id,
    name,
    price,
    description,
    discount,
  };

  const newProductList = products.map((item) => {
    if (item.id.toString() === id.toString()) {
      return updateData;
    };

    return item;
  })

  await writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công",
    payload: updateData,
  });
});

/* UPDATE - PATCH. */
router.patch('/:id', async function (req, res, next) {
  const { id } = req.params;
  const { name, price, description, discount } = req.body; // case 1

  console.log('««««« req.body »»»»»', req.body);

  let updateData = {};

  const newProductList = products.map((item) => {
    if (item.id.toString() === id.toString()) {
      updateData = combineObjects(item, { name, price, description, discount });

      return updateData;
    };

    return item;
  })

  console.log('««««« updateData »»»»»', updateData);

  await writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công",
    payload: updateData,
  });
});

/* DELETE - SOFT. */
router.patch('/delete/:id', async function (req, res, next) {
  const { id } = req.params;

  const newProductList = products.map((item) => {
    if (item.id.toString() === id.toString()) {
      return {
        ...item,
        isDeleted : true,
      };
    };

    return item;
  })

  console.log('««««« newProductList »»»»»', newProductList);

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
