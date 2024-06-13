var express = require('express');
var router = express.Router();
const users = require('../models/users');

const jwtMiddleware = require('../middleware/jwtMiddleware');
const balanceFluctuations = require('../models/balanceFluctuation');

/* GET users listing. */
router.get('/', jwtMiddleware.verifyToken, function (req, res, next) {
  res.send('respond with a resource');
});
// list
router.get('/list', jwtMiddleware.verifyToken, async (req, res, next) => {
  const { page, result } = req.query;

  const OPTIONS = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(result, 10) || 10,
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
  // query.createAt = { $gte: req.query.fromDate, $lte: req.query.toDate }

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



module.exports = router;
