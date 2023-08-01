const { Supplier } = require('../../models');
let suppliers = require('../../data/suppliers.json');
const { generationID, writeFileSync, fuzzySearch, combineObjects } = require('../../helper');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const result = await Supplier.find({ isDeleted: false });

      res.send(200, {
        message: "Thành công",
        payload: result,
      });
    } catch (error) {
      return res.send(404, {
        message: "Không tìm thấy",
      })
    }
  },

  search: async (req, res, next) => {
    try {
      const { name, address } = req.query;
      const conditionFind = { isDeleted: false };

      if (name) conditionFind.name = fuzzySearch(name);
      if (address) conditionFind.address = fuzzySearch(address);

      const result = await Supplier.find(conditionFind)

      res.send(200, {
        message: "Thành công",
        payload: result,
      });
    } catch (error) {
      return res.send(404, {
        message: "Không tìm thấy",
      })
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await Supplier.findOne({
        _id: id,
        isDeleted: false,
      });

      if (result) {
        return res.send(200, {
          message: "Thành công",
          payload: result,
        });
      }

      return res.send(404, {
        message: "Không tìm thấy",
      })
    } catch (error) {
      return res.send(404, {
        message: "Không tìm thấy",
      })
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, email, phoneNumber, address } = req.body;

      const newRecord = new Supplier({
        name, email, phoneNumber, address,
      });

      let result = await newRecord.save();

      return res.send(200, {
        message: "Thành công",
        payload: result,
      });
    } catch (error) {
        return res.send(404, {
        message: "Không tìm thấy",
        error,
      })
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phoneNumber, address, isDeleted } = req.body;

    const existEmail = await suppliers.find((item) => item.email === email);
    if (existEmail) {
      return res.send(400, {
        message: "Email đã tồn tại",
      });
    }

    const existPhone = await suppliers.find((item) => item.phoneNumber === phoneNumber);
    if (existPhone) {
      return res.send(400, {
        message: "SDT đã tồn tại",
      });
    }

    const updateData = {
      id, name, email, phoneNumber, address, isDeleted
    };

    let isErr = false;

    const newSuppliers = suppliers.map((item) => {
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
      writeFileSync('./data/suppliers.json', newSuppliers);

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

    const newSuppliers = suppliers.map((item) => {
      if (item.id.toString() === id.toString()) {
        return {
          ...item,
          isDeleted: true,
        };
      };

      return item;
    })

    await writeFileSync('./data/suppliers.json', newSuppliers);

    return res.send(200, {
      message: "Thành công xóa",
    });
  },
};