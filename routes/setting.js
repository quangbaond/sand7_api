var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const settings = require('../models/setting');

const jwtMiddleware = require('../middleware/jwtMiddleware');

/* GET users listing. */
router.get('/', jwtMiddleware.verifyToken, async function (req, res, next) {
    const setting = await settings.findOne()

    console.log(setting);

    res.status(200).send(setting);
});

router.put('/', jwtMiddleware.verifyToken, async (req, res, next) => {
    const { value } = req.body;

    const setting = await settings.findOne({
        name: 'game',
    });

    if (!setting) {
        return res.status(404).send('Setting not found');
    }

    setting.value = value;

    await setting.save();

    res.status(200).send(setting);
});

module.exports = router;