const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({

    "email" : String,
    "deviceModel" : String,
    "os" : String,
    "refreshToken" : String
})

module.exports = mongoose.model('USERS' , userSchema);