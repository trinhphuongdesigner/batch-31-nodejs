var express = require('express');
const fs = require('fs');
var router = express.Router();

let products = require('../data/products.json');

const writeFileSync = (path, data) => {
  console.log('««««« data »»»»»', data);
  fs.writeFileSync(path, JSON.stringify(data), function (err) {
    if (err) {
      console.log('««««« err »»»»»', err);

      throw err
    };
    console.log('Saved!');
  });
}

const generationID = () => Math.floor(Date.now());

/* GET LIST. */
router.get('/', function (req, res, next) {
  res.send(200, {
    message: "Thành công",
    payload: products,
  });
});

/* GET DETAIL. */
router.get('/:id', function (req, res, next) {
  const { id } = req.params;
  const product = products.find((item) => item.id.toString() === id.toString());

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
    { name, price, id: generationID() }
  ];

  writeFileSync('./data/products.json', newProductList);

  return res.send(200, {
    message: "Thành công",
    // payload: products,
  });
});

module.exports = router;
