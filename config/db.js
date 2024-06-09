var mongoose = require('mongoose');
const initAdmin = require('../common/init').initAdmin;

// connect db
mongoose.connect('mongodb://localhost:27017/sandsv7', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.info('Kết nối cơ sở dữ liệu thành công! 🙋');
    initAdmin();
}).catch((err) => {
    console.error('Lỗi kết nối cơ sở dữ liệu 🚨');
    console.error(err);
});
