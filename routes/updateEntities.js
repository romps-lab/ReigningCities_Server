const express = require('express');
const router = express.Router();
const playerCollection = require('../models/users')
const utility = require('../Utility/utility')

router.post('/' , async function(req, res){
  

  var reqEmail = req.get("email");
  var resources = req.body.entities;

  playerDocument = await utility.updatePlayerEntities(playerCollection , reqEmail , resources);

  return res.status(process.env.OK).send(playerDocument);
  
});

module.exports = router;