const historyBet = require('../models/games/historyBet');
const users = require('../models/users');
const Sx5d = require('../models/games/Sx5d');
const setting = require('../models/setting');

module.exports = async (socket, data) => {
    // // Logic xử lý sự kiện onBet
    socket.on('onBet', (data) => {
        console.log('onBet event received with data:', data);
        onBet(socket, data);
    });
};

const onBet = async (socket, data) => {
    const { betDataID, amount, betInUser, userID, code, username } = data;
    const historyBetData = {
        betDataID,
        userID,
        amount,
        betInUser,
        code
    }
    try {
        await historyBet.create(historyBetData);

        const user = await users.findOne({ _id: userID });

        // check setting
        // const settingData = await setting.findOne({ name: 'game' });
        // let amountData = amount;
        // // check xem người dùng có đánh id = 0 và value là 1 và 2 hay không
        // // id === 0 && (value === 1 || value === 2) && type === 'sx5d'
        // betInUser.forEach(bet => {
        //     const { id, value } = bet;

        //     // Kiểm tra điều kiện setting == '2.1' và id == 0
        //     if (id === 0 && (value === 1 || value === 2) && code === 'sx5d') {
        //         if (settingData.value === '1.98') {
        //             // trừ 5% số tiền đặt cược
        //             amountData = amount + amount * 0.05;

        //         } else {
        //            amountData = amount;
        //         }
        //     }
        // });
        user.balance -= amount;

        await user.save();

        const betData = await Sx5d.findOne({ _id: betDataID });
        betData.resultMoney += amount;
        await betData.save();

        // get HistoryBetList
        const historyBetList = await historyBet.findOne({ betDataID: betDataID }).sort({ createAt: -1 }).populate('user');

        socket.broadcast.emit(`betDataUser-${code}`, { historyBetList });
        // get balance user
        const userBalance = await users.findOne({ _id: userID });
        socket.emit(`betDataResponse-${userID}`, { status: 'success', balance: userBalance.balance });

    }
    catch (error) {
        console.log(error);
        socket.emit('betDataResponse', { status: 'fail' });
    }
}