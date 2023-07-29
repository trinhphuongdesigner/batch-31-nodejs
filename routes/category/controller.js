const { default: mongoose } = require('mongoose');

const { Category } = require('../../models');
const { generationID, writeFileSync, fuzzySearch, combineObjects } = require('../../helper');
let categories = require('../../data/categories.json');

// mongoose.connect('mongodb://localhost:27017/node-31-database');
mongoose.connect('mongodb://127.0.0.1:27017/node-31-database');

module.exports = {
  getAll: async (req, res, next) => {
    res.send(200, {
      message: "Thành công",
      payload: categories.filter((item) => !item.isDeleted),
    });
  },

  search: async (req, res, next) => {
    const { name } = req.query;
    let productFilter = [];

    if (name) {
      const searchRex = fuzzySearch(name);

      productFilter = categories.filter((item) => {
        if (!item.isDeleted && searchRex.test(item.name)) {
          return item;
        }
      })
    } else {
      productFilter = categories.filter((item) => !item.isDeleted);
    }

    res.send(200, {
      message: "Thành công",
      payload: productFilter,
    });
  },

  getDetail: async (req, res, next) => {
    const { id } = req.params;
    const category = categories.find((item) => item.id.toString() === id.toString());

    if (category) {
      if (category.isDeleted) {
        return res.send(400, {
          message: "Sản phẩm đã bị xóa",
        });
      }

      return res.send(200, {
        message: "Thành công",
        payload: category,
      });
    }

    return res.send(404, {
      message: "Không tìm thấy",
    })
  },

  create: async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const newRecord = new Category({
        name, description,
      });

      let result = await newRecord.save();

      return res.send(200, {
        message: "Thành công",
        payload: result,
      });
    } catch (err) {
      return res.send(400, {
        message: "Thất bại",
        errors: err,
      });
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { name, description, isDeleted } = req.body;

    const updateData = {
      id,
      name,
      description,
      isDeleted,
    };

    let isErr = false;

    const newCategories = categories.map((item) => {
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
      writeFileSync('./data/categories.json', newCategories);

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

    const newCategories = categories.map((item) => {
      if (item.id.toString() === id.toString()) {
        return {
          ...item,
          isDeleted: true,
        };
      };

      return item;
    })

    await writeFileSync('./data/categories.json', newCategories);

    return res.send(200, {
      message: "Thành công xóa",
    });
  },
};