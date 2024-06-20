var express = require('express');
var router = express.Router();
const users = require('../models/users');

const jwtMiddleware = require('../middleware/jwtMiddleware');
const balanceFluctuations = require('../models/balanceFluctuation');
const requestMoney = require('../models/requestMoney');

/* GET users listing. */
router.get('/', jwtMiddleware.verifyToken, function (req, res, next) {
  res.send('respond with a resource');
});
// list
router.get('/list', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { page, results } = req.query;

  const OPTIONS = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(results, 10) || 10,
    sort: { createAt: -1 },
  }
  const query = {};
  if (req.query.username) {
    query.username = req.query.username;
  }
  if (req.query.email) {
    query.email = req.query.email;
  }
  if (req.query.phone) {
    query.phone = req.query.phone;
  }
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.search) {
    query.$or = [
      { username: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.fromDate && req.query.toDate) {
    query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }
  }

  const userList = await users.paginate(query, OPTIONS);

  res.status(200).send(userList);

})

// update
router.put('/:id', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { phone, balance, status, email, role } = req.body;

  // update user
  const user = await users.findById(id);
  if (!user) {
    return res.status(404).send('User not found');
  }

  let type = 'plus';
  let amount = balance - user.balance;
  if (amount < 0) {
    type = 'minus';
    amount = Math.abs(amount);
  }
  const formatDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // 2019-12-10 10:00:00
  const balanceFluctuation = new balanceFluctuations({
    userID: id,
    amount,
    type,
    description: 'Update balance',
    reson: `Bạn được cập nhật số dư ${formatCurrency(user.balance)} thành ${formatCurrency(parseFloat(balance))} vào lúc ${formatDate}`,
  });
  await balanceFluctuation.save();

  const userUpdate = await users.findByIdAndUpdate(id, { phone, balance: parseFloat(balance), status, email, role });

  if (!userUpdate) {
    return res.status(404).send('User not found');
  }
  res.status(200).send(userUpdate);
});

const formatCurrency = (value) => {
  if (!value) return 0;
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

router.get('/get-request-money', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { page, results } = req.query;

  const OPTIONS = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(results, 10) || 10,
    sort: { createAt: -1 },
    populate: 'user'
  }
  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.fromDate && req.query.toDate) {
    query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }
  }

  if (req.query.username) {
    // search user regex
    const user = await users.findOne({ username: { $regex: req.query.username, $options: 'i' } });
    console.log(user);
    if (user) {
      query.userID = user._id;
    } else {
      query.userID = null;
    }
  }
  console.log(query);


  const requestMoneyData = await requestMoney.paginate(query, OPTIONS);

  res.status(200).send(requestMoneyData);
});

router.put('/update-request-money/:id', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const requestMoneyFind = await requestMoney.findById(id);

  if (!requestMoneyFind) {
    return res.status(404).send('Request money not found');
  }

  const requestMoneyUpdate = await requestMoney.findByIdAndUpdate(id, { status });

  if (!requestMoneyUpdate) {
    return res.status(404).send('Request money not found');
  }

  res.status(200).send(requestMoneyUpdate);
})



module.exports = router;
