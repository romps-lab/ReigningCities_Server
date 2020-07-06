const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({

    "_id" : String,
    "entities" : ""
})

module.exports = mongoose.model('USERS' , userSchema);