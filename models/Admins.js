const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    adminID: {type: String, lowercase: true},
    fullname: {type: String, lowercase: true},
    password: {type: String}
});

module.exports = mongoose.model('admins', AdminSchema);
