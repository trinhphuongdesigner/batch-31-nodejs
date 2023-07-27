let products = require('../../data/products.json');
let suppliers = require('../../data/suppliers.json');
let categories = require('../../data/categories.json');
const { generationID, writeFileSync, fuzzySearch, combineObjects } = require('../../helper');

module.exports = {
  getAll: async (req, res, next) => { // NOTE
    let productList = products.filter((item) => !item.isDeleted);

    productList = productList.map((product) => {
      const { supplierId, categoryId } = product;

      const category = categories.find((item) => item.id.toString() === categoryId.toString());
      const supplier = suppliers.find((item) => item.id.toString() === supplierId.toString());

      // delete product['supplierId'];
      // delete product['categoryId'];

      return {
        ...product,
        category,
        supplier,
      };
    })

    res.send(200, {
      message: "Thành công",
      payload: productList,
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

      productFilter = productFilter.map((product) => {
        const { supplierId, categoryId } = product;
        console.log('««««« product »»»»»', product);
  
        const category = categories.find((item) => item.id.toString() === categoryId.toString());
        const supplier = suppliers.find((item) => item.id.toString() === supplierId.toString());
  
        // delete product['supplierId'];
        // delete product['categoryId'];
        return {
          ...product,
          category,
          supplier,
        };
      })
    } else {
      productFilter = products.filter((item) => !item.isDeleted);

      productFilter = productFilter.map((product) => {
        const { supplierId, categoryId } = product;
  
        const category = categories.find((item) => item.id.toString() === categoryId.toString());
        const supplier = suppliers.find((item) => item.id.toString() === supplierId.toString());
  
        delete product['supplierId'];
        delete product['categoryId'];
  
        return {
          ...product,
          category,
          supplier,
        };
      })
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
      };

      const { supplierId, categoryId } = product;

      const category = categories.find((item) => item.id.toString() === categoryId.toString());
      const supplier = suppliers.find((item) => item.id.toString() === supplierId.toString());

      delete product['supplierId'];
      delete product['categoryId'];

      return res.send(200, {
        message: "Thành công",
        payload: {
          ...product,
          category,
          supplier,
        },
      });
    }

    return res.send(404, {
      message: "Không tìm thấy",
    })
  },

  create: async (req, res, next) => {
    const { name, price, discount, stock, description, isDeleted, supplierId, categoryId } = req.body;

    const existSupplier = await suppliers.find((item) => item.id.toString() === supplierId.toString());
    if (!existSupplier || existSupplier.isDeleted) {
      return res.send(400, {
        message: "Nhà cung cấp không khả dụng",
      });
    }

    const existCategory = await categories.find((item) => item.id.toString() === categoryId.toString());
    if (!existCategory || existCategory.isDeleted) {
      return res.send(400, {
        message: "Danh mục không khả dụng",
      });
    }

    const newProductList = [
      ...products,
      { id: generationID(), name, price, discount, stock, description, isDeleted, categoryId, supplierId }
    ];

    writeFileSync('./data/products.json', newProductList);

    return res.send(200, {
      message: "Thành công",
      // payload: products,
    });
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { name, price, description, discount, stock, isDeleted, categoryId, supplierId } = req.body; // case 1


    const existSupplier = await suppliers.find((item) => item.id.toString() === supplierId.toString());
    if (!existSupplier || existSupplier.isDeleted) {
      return res.send(400, {
        message: "Nhà cung cấp không khả dụng",
      });
    }

    const existCategory = await categories.find((item) => item.id.toString() === categoryId.toString());
    if (!existCategory || existCategory.isDeleted) {
      return res.send(400, {
        message: "Danh mục không khả dụng",
      });
    }


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
      categoryId,
      supplierId,
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