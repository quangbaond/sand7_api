var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const users = require('../models/users');


const jwtMiddleware = require('../middleware/jwtMiddleware');

/* GET users listing. */
router.get('/profile', jwtMiddleware.verifyToken, function (req, res, next) {
    let token = req.session.token;

    if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).send({ message: "Đăng nhập hết hạn, Vui lòng đăng nhập lại!" });
    }
    console.log(token);
    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send({
                message: "Tài khoản không hợp lệ",
            });
        }
        const userFind = await users.findById(decoded.id);
        if (userFind) {
            res.status(200).send({ user: userFind });
        } else {
            res.status(404).send({ message: "Tài khoản không tồn tại" });
        }
    });
});

module.exports = router;