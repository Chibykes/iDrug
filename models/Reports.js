const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    reporter: {type: String},
    name: {type: String},
    pharmacy: {type: String},
    batchNo: {type: String},
    issue: {type: String},
}, { timestamps: true });

module.exports = mongoose.model('reports', ReportSchema);