const user = require('../models/users');
const md5 = require('md5');
const initAdmin = async () => {

    if (await user.findOne({ username: 'admin' })) {
        console.log("Đã có tài khoản admin trong hệ thống!");
        return;
    }
    const username = 'admin';
    const password = 'admin';

    const password2 = 'admin';
    const email = 'admin@gmail.com';
    const phone = '0123456789';

    const inviteCode = '888';

    await user.create({
        username,
        password: md5(password),
        password2: md5(password2),
        email,
        phone,
        inviteCode,
        role: 'admin'
    })

    console.info("Đã tạo tài khoản admin thành công!");

    return "Đã tạo tài khoản admin thành công!";
}

module.exports = {
    initAdmin
}
