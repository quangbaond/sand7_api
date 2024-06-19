var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const users = require('../models/users');
const balanceFluctuations = require('../models/balanceFluctuation');
const historyBet = require('../models/games/historyBet');
const requestMoney = require('../models/requestMoney');


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

//balanceFluctuations
router.get('/get-balance-fluctuation/:userID', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { page, result } = req.query;
    const { userID } = req.params;

    if (!userID) {
        return res.status(400).send({ message: "Người dùng không hợp lệ" });
    }

    const OPTIONS = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(result, 10) || 10,
        sort: { createAt: -1 },
        populate: 'user'
    }
    const query = {};
    query.userID = userID;
    if (req.query.type) {
        query.type = req.query.type;
    }
    if (req.query.fromDate && req.query.toDate) {
        query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }
    }

    const balanceFluctuationData = await balanceFluctuations.paginate(query, OPTIONS);

    res.status(200).send(balanceFluctuationData);

})
router.get('/historybet/:userID', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { page, result } = req.query;
    const { userID } = req.params;

    if (!userID) {
        return res.status(400).send({ message: "Người dùng không hợp lệ" });
    }

    const OPTIONS = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(result, 10) || 10,
        sort: { createAt: -1 },
        populate: 'betData'
    }
    const query = {};
    query.userID = userID;
    if (req.query.type) {
        query.type = req.query.type;
    }
    if (req.query.fromDate && req.query.toDate) {
        query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }
    }

    const historyBetsData = await historyBet.paginate(query, OPTIONS);

    res.status(200).send(historyBetsData);
});

router.post('/link-bank', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { bankAccountNumber, bankName, bankBranch, bankAccountName } = req.body;
    let token = req.session.token;

    if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).send({ message: "Đăng nhập hết hạn, Vui lòng đăng nhập lại!" });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Tài khoản không hợp lệ",
            });
        }
        const userFind = await users.findById(decoded.id);
        if (userFind) {
            userFind.bankAccountNumber = bankAccountNumber;
            userFind.bankName = bankName;
            userFind.bankBranch = bankBranch;
            userFind.bankAccountName = bankAccountName;
            await userFind.save();
            res.status(200).send({ message: "Cập nhật thành công" });
        } else {
            res.status(404).send({ message: "Tài khoản không tồn tại" });
        }
    });
});
router.post('/deposit', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { amount, note } = req.body;
    let token = req.session.token;

    if (req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).send({ message: "Đăng nhập hết hạn, Vui lòng đăng nhập lại!" });
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Tài khoản không hợp lệ",
            });
        }
        const userFind = await users.findById(decoded.id);
        if (userFind) {
            const newRequestMoney = new requestMoney({
                userID: userFind._id,
                amount: amount,
                note: note
            });
            await newRequestMoney.save();

            userFind.balance -= amount;
            await userFind.save();
            res.status(200).send({ message: "Yêu cầu rút tiền thành công", user: userFind });
        } else {
            res.status(404).send({ message: "Tài khoản không tồn tại" });
        }
    });
});
module.exports = router;