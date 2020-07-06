const express = require('express');
const router = express.Router();
const fs = require('fs');
const utility = require('../Utility/utility')

router.post('/' , function(req, res, next){

    let gameConfigData = fs.readFileSync("GameConfig.json");
    let gameConfigJson = JSON.parse(gameConfigData);
    console.log(gameConfigJson);

    res.send(gameConfigJson);
});

module.exports = router;