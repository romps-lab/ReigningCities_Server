const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi =  require('@hapi/joi');
const mongoose = require('mongoose');
const userModel = require('../models/users')
const jwt_decode = require('jwt-decode')


const refreshAccessSchema = joi.object({

    accessToken : joi.string().required(),
    refreshToken : joi.string().required()
  })

//DONT KNOW DO I HAVE TO CONFIGURE MONGOOSE IN EACH MODULE
mongoose.connect('mongodb://localhost:27017/reigningcities' , 
                { useNewUrlParser: true , useUnifiedTopology: true, 'useFindAndModify': false})
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
    });


router.post('/' , async function(req, res, next){
    //VALIDATE POST BODY PARAMETERS.
    const {value , error} = refreshAccessSchema.validate(req.body);
    // IF INVALID PARAMETERS : STATUS_CODE = 400 (BADREQUEST)
    if(error){
        return res.status(process.env.BADREQUEST)
                .send(error.details[0].message);
    }

    if(!isAccessTokenValid(req.body.accessToken , res)){return};
    //DOESNOT CHECK FOR EXPIRED REFRESH TOKEN , ONLY VALIDATES PAYLOAD
    if(!isRefreshTokenValid(req.body.refreshToken , res)){return};

    /*if(!areTokensValid(req.body , res)){
        //DONT SET RESPONSE BODY AS ITS ALREADY TAKEN CARE OF JUST RETURN.
        return
    }*/

    let email = await isTokenComboValid(req.body , res);
    if(email == undefined ){
        //DONT SENT RESPONSE BODY AS ITS ALREADY TAKEN CARE OF JUST RETURN.
        return
    }

    let newAccessToken = jwt.sign({'email' : email} , 
                                process.env.ACCESSTOKEN_SECRET,
                                { expiresIn: process.env.ACCESSTOKEN_EXP_TIME } );

    return res.status(process.env.OK).jsonp({"accessToken" : newAccessToken});

});

/*
function areTokensValid(tokens , res){
    let accessToken = tokens.accessToken;
    let refreshToken = tokens.refreshToken;

    if(!isAccessTokenValid(accessToken , res)){return false};
    if(!isRefreshTokenValid(refreshToken , res)){return false};

    return true;
    
}
*/

function isAccessTokenValid(token , res){
    let isValid = false;
    try {
        //should always throw token expired error...
        const verified = jwt.verify(token , process.env.ACCESSTOKEN_SECRET);
        //token is valid but request is not....
        res.status(process.env.UNPROCESSABLE).send("Token Still Valid");
        return isValid;
    }
    catch (err) 
    { 
            
        if(err.name == process.env.TOKEN_JWT_ERROR){
            // PACKET IS CHANGED IN BETWEEN SEND 400
            res.status(process.env.BADREQUEST).send("Packet Tempered");
            return isValid
        }
        else if(err.name == process.env.TOKEN_EXP_ERROR){
            //Request is valid , cross checked, this is what expected
            return true
        }
        //IF SOME UNKNOWN ISSUES....
        res.status(process.env.NOTFOUND).send("Unknown");
    }

    return isValid;
}

function isRefreshTokenValid(token , res){
    let isValid = false;
    try {
        const verified = jwt.verify(token , process.env.REFRESHTOKEN_SECRET);
        return true;
    }
    catch (err) 
    { 
            
        if(err.name == process.env.TOKEN_JWT_ERROR){
            // PACKET IS CHANGED IN BETWEEN SEND 400
            res.status(process.env.BADREQUEST).send("Packet Tempered");
            return isValid;
        }
        else if(err.name == process.env.TOKEN_EXP_ERROR){
            //USER IS USING OLD REFRESH TOKEN(CAUSE DUR TO USE OF MULTIPLE DEVICE)
            //DONT MARK THIS STAGE AS ERROR AS IT CAN HAPPEN (HERE WE R JUST CHECKING VALIDITY OF PAYLOAD)
            //JUST GIVE USERS THERE CURRENT REFRESH TOKEN.
            //res.status(process.env.UNPROCESSABLE).send("Token Expired");
            return true;
        }
        //IF SOME UNKNOWN ISSUES....
        res.status(process.env.NOTFOUND).send("Unknown");
        isValid = false;
    }

    return isValid;
}

async function isTokenComboValid(tokens , res){
    //At this stag tokens are verified individually and valid.

    //get user email from accesstoken
    let payloadAccess = jwt_decode(tokens.accessToken);
    let payloadRefresh = jwt_decode(tokens.refreshToken);
    let emailAccess = payloadAccess.email;
    let emailRefresh = payloadRefresh.email;

    if(emailAccess.localeCompare(emailRefresh) != 0){
        //access token and refress token are of different valid users
        res.status(process.env.CONFLICT).send("Users Mismatch");
        return undefined;
    }

    //get refreshToken from obtained user
    let user = await userModel.find({"email" : emailAccess})
                            .then(
                                doc => {
                                    if(doc.length){
                                       console.log(doc);
                                        return doc[0];
                                    }
                                })
                                .catch(
                                    err =>{
                                    return undefined;
                                });
    
    if(user == undefined){
        //very  very unlikely case, but still 
        res.status(process.env.CONFLICT).send("Unknown");
        return undefined;
    }

    //compare refreshTokens to check if client has sent most rcent refresh token
    //to get new access token as DB is expected to store the most recent refreshToken.
    if(user.refreshToken.localeCompare(tokens.refreshToken) != 0){
        //BOTH ARE DIFFERENT
        //USER IS USING OLD REFRESH TOKEN.
        res.status(process.env.FORBIDDEN).send("OLD REFRESH TOKEN");
        return undefined;
    }
    //Is refresh token expired? Obtain completly new pair of tokens
    if(isTokenExpired(tokens.refreshToken)){
        res.status(process.env.FORBIDDEN).send("REFRESH TOKEN EXPIRED");
        return undefined;
    }
    
    return emailAccess;
    
}

function isTokenExpired(token){
    let isExpired = false;
    try {
        const verified = jwt.verify(token , process.env.REFRESHTOKEN_SECRET);
        return false;
    }
    catch (err) 
    { 
        if(err.name == process.env.TOKEN_EXP_ERROR){
            return true;
        }
        return false;
    }

    return isExpired;
}


module.exports = router;