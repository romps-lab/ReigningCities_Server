const express = require('express');
const router = express.Router();
const fs = require('fs');
const utility = require('../Utility/utility')

router.post('/' , function(req, res, next){

    var accessToken = req.header('accessToken');
    if(!accessToken) return res.status(process.env.UNAUTHORIZED).send('REQUIRE TOKEN');

    let {isGood , statusCode} = utility.verifyToken(accessToken , process.env.ACCESSTOKEN_SECRET);
    if(!isGood)return res.status(statusCode).send('Request CANCLED');

    let gameConfigData = fs.readFileSync("GameConfig.json");
    let gameConfigJson = JSON.parse(gameConfigData);
    console.log(gameConfigJson);

    res.send(gameConfigJson);
});

module.exports = router;