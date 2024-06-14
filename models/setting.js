const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;


const setting = new Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String, required: false },
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
}, { collection: 'settings', virtuals: true, toJSON: { virtuals: true } })

setting.plugin(mongoosePaginate)

module.exports = mongoose.model('settings', setting)