const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi =  require('@hapi/joi');


router.get('/' , function(req, res){
    const {value , error} = joi.string().required().validate(req.get("accessToken"));
    if(error){
        return res.status(process.env.UNAUTHORIZED).send(error.details[0].message);
    }
    console.log(value);

    try {
        const decoded = jwt.verify(value , process.env.ACCESSTOKEN_SECRET);
        return res.status(process.env.OK).send("ALL_IS_WELL");
       }
       catch (err) { 
            
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


module.exports = router;