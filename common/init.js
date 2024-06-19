const users = require('../models/users');
const md5 = require('md5');
const settingGame = require('../models/setting');

const initAdmin = async () => {

    if (await users.findOne({ username: 'admin123' })) {
        console.log("Đã có tài khoản admin trong hệ thống!");
        return;
    }
    const username = 'admin123';
    const password = 'admin123';

    const password2 = 'admin123';
    const email = 'admin@gmail.com';
    const phone = '0123456789';

    const inviteCode = '888';

    await users.create({
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

const intSettingGame = async () => {
    if (await settingGame.findOne({ name: 'game' })) {
        console.log("Đã có cài đặt game trong hệ thống!");
        return;
    }

    await settingGame.create({
        name: 'game',
        value: '1.98'
    })

    console.info("Đã tạo cài đặt game thành công!");

    return "Đã tạo cài đặt game thành công!";
}

module.exports = {
    initAdmin,
    intSettingGame
}
