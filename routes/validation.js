const yup = require('yup');

module.exports = yup.object({ // BỘ LỌC RIÊNG CHO TỪNG TRƯỜNG HỢP
  params: yup.object({
    id: yup.number(),
  }),
});
