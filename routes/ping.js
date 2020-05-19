const express = require('express');
const router = express.Router();
const playerCollection = require('../models/users')
const utility = require('../Utility/utility')

router.post('/' , async function(req, res){
  

  var reqEmail = req.get("email");
  if(reqEmail == undefined){
    return res.status(process.env.BADREQUEST).send("Email Required");
  }
  let playerDocument = await utility.isPlayerExist(playerCollection , reqEmail);
  if(playerDocument == undefined){
    await utility.registerPlayer(playerCollection , reqEmail)
  }

  playerDocument = await utility.isPlayerExist(playerCollection , reqEmail);
  let playerEntities = playerDocument.entities;

  return res.status(process.env.OK).send({"entities" : playerEntities});
  
});

module.exports = router;