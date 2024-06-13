const jwt = require("jsonwebtoken");
const config = require("../config/auth.js");

const verifyToken = (req, res, next) => {
    // get token from header
    let token = req.session.token;

    if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }


    if (!token) {
        return res.status(401).send({ message: "Đăng nhập hết hạn, Vui lòng đăng nhập lại!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Tài khoản không hợp lệ",
            });
        }

        req.userId = decoded.id;
        next();
    });
};

// notlogin

const notLogin = (req, res, next) => {
    let token = req.session.token;

    if (token) {
        return res.status(400).send({ message: "Bạn đã đăng nhập" });
    }
    next();
}

module.exports = {
    verifyToken,
    notLogin
};