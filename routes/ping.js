const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi =  require('@hapi/joi');
const jwt_decode = require('jwt-decode')
const userModel = require('../models/users')

router.get('/' , async function(req, res){
    const {value , error} = joi.string().required().validate(req.get("accessToken"));
    if(error){
        return res.status(process.env.UNAUTHORIZED).send(error.details[0].message);
    }
    try {
        const verified = jwt.verify(value , process.env.ACCESSTOKEN_SECRET);
        //check if user for that access token exist..
        let payload = jwt_decode(value);
        let user = await doesUserExist(payload.email);
        console.log(user);
        if(user != undefined){
            return res.status(process.env.OK).send("ALL_IS_WELL");
        }
        return res.status(process.env.CONFLICT).send("User Not Present");
       }
       catch (err) { 
            //console.log(err);
            if(err.name == process.env.TOKEN_JWT_ERROR){
                // PACKET IS CHANGED IN BETWEEN SEND 400
                return res.status(process.env.BADREQUEST).send("Packet Tempered");
            }
            else if(err.name == process.env.TOKEN_EXP_ERROR){
                //TOKEN IN EXPIRED SEND 422
                return res.status(process.env.UNPROCESSABLE).send("Token Expired");
            }
            //IF SOME UNKNOWN ISSUES....
            return res.status(process.env.NOTFOUND).send("Unknown");

        }
});


async function doesUserExist(email){

    let exists =  await userModel.find({"email" : email})
             .then(
               doc => {
                  if(doc.length){
                    //console.log(doc);
                    return doc[0];
                  }
                })
              .catch(
                err =>{
                  return undefined;
              });
    //console.log("Exists : " + exists);
    return exists;
  
  }

module.exports = router;