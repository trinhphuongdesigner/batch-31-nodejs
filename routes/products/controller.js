let products = require('../../data/products.json');
const { generationID, writeFileSync, fuzzySearch, combineObjects } = require('../../helper');

module.exports = {
  getList: async (req, res, next) => {
    res.send(200, {
      message: "Thành công",
      payload: products.filter((item) => !item.isDeleted),
    });
  },

  search: async (req, res, next) => {
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
  },

  getDetail: async (req, res, next) => {
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
  },

  create: async (req, res, next) => {
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
  },

  update: async (req, res, next) => {

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
  },

  updatePatch: async (req, res, next) => {
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
  },

  softDelete: async (req, res, next) => {
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
  },

  hardDelete: async (req, res, next) => {
    const { id } = req.params;
  
    const newProductList = products.filter((item) => item.id.toString() !== id.toString());
  
    await writeFileSync('./data/products.json', newProductList);
  
    return res.send(200, {
      message: "Thành công xóa",
    });
  },
};