let suppliers = require('../../data/suppliers.json');
const { generationID, writeFileSync, fuzzySearch, combineObjects } = require('../../helper');

module.exports = {
  getAll: async (req, res, next) => {
    res.send(200, {
      message: "Thành công",
      payload: suppliers.filter((item) => !item.isDeleted),
    });
  },

  search: async (req, res, next) => {
    const { name } = req.query;
    let productFilter = [];
  
    if (name) {
      const searchRex = fuzzySearch(name);
  
      productFilter = suppliers.filter((item) => {
        if (!item.isDeleted && searchRex.test(item.name)) {
          return item;
        }
      })
    } else {
      productFilter = suppliers.filter((item) => !item.isDeleted);
    }
  
    res.send(200, {
      message: "Thành công",
      payload: productFilter,
    });
  },

  getDetail: async (req, res, next) => {
    const { id } = req.params;
    const supplier = suppliers.find((item) => item.id.toString() === id.toString());
  
    if (supplier) {
      if (supplier.isDeleted) {
        return res.send(400, {
          message: "Sản phẩm đã bị xóa",
        });
      }
  
      return res.send(200, {
        message: "Thành công",
        payload: supplier,
      });
    }
  
    return res.send(404, {
      message: "Không tìm thấy",
    })
  },

  create: async (req, res, next) => {
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

    const newSuppliers = [
      ...suppliers,
      { id: generationID(), name, email, phoneNumber, address, isDeleted }
    ];
  
    writeFileSync('./data/suppliers.json', newSuppliers);
  
    return res.send(200, {
      message: "Thành công",
    });
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