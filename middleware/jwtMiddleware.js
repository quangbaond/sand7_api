const jwt = require("jsonwebtoken");
const config = require("../config/auth.js");

const verifyToken = (req, res, next) => {
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({ message: "Không có quyền truy cập" });
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