var express = require('express');
var router = express.Router();

const jwtMiddleware = require('../middleware/jwtMiddleware');

/* GET users listing. */
router.get('/', jwtMiddleware.verifyToken, function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
