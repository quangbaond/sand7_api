var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const users = require('../models/users');


const jwtMiddleware = require('../middleware/jwtMiddleware');
const historyBet = require('../models/games/historyBet');

/* GET users listing. */
router.get('/id/:sessionId', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { sessionId } = req.params;

    const historyBetList = await historyBet.find({ betDataID: sessionId }).sort({ createAt: -1 }).populate('user');


    res.status(200).send(historyBetList);
})

router.get('/get/:code', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { page, limit } = req.query;
    const { code } = req.params;
    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        sort: { createAt: -1 },
        populate: 'user betData'
    }
    const query = {
        code: code
    }
    if (req.query.fromDate && req.query.toDate) {
        query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }
    }

    if (req.query.username) {
        const user = await users.findOne({ username: req.query.username });
        query.userID = user._id;
    }

    const historyBetList = await historyBet.paginate(query, options);
    console.log(historyBetList);

    res.status(200).send(historyBetList);
})

module.exports = router;