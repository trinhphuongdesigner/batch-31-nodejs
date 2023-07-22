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

module.exports = fuzzySearch;


const generationID = () => Math.floor(Date.now());

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
