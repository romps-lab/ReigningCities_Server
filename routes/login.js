const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi =  require('@hapi/joi');
const mongoose = require('mongoose');
const userModel = require('../models/users')

/*
  <POST>
  This endpoint tries to create new user based on platform specific 
  account string(that we believe is true) that client sends.

  INPUT:
          email         = user platform specific information(required)
          deviceModel   = Device name of the user(optional)
          os            = Client OS(optional)

  Following are the status code sbmitted to client based current 
  server state.

    SUCCESS =>  IF NEW USER DETECTED AFTER CHECKING DB
                  STATUS_CODE = 201 (CREATED)
                IF USER ALREADY EXIST IN DB && RefreshToken expired
                  STATUS_CODE = 200 (OK)
                ACCESS_TOKEN & REFRESH_TOKEN INSIDE HEADER
                
    FAILED => IF USER ALREADY EXIST && RefreshToken not expired
                STATUS_CODE = 409 (CONFLICT)
              IF INVALID PARAMETERS
                STATUS_CODE = 400 (BADREQUEST)

*/

const loginParamSchema = joi.object({

  email : joi.string().email().required(),
  deviceModel : joi.string().optional(),
  os : joi.string().optional(),
  refreshToken : joi.string().optional()

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


router.post('/' , async function(req, res, next) {
  //VALIDATE POST BODY PARAMETERS.
  const {value , error} = loginParamSchema.validate(req.body);

  // IF INVALID PARAMETERS : STATUS_CODE = 400 (BADREQUEST)
  if(error){
    return res.status(process.env.BADREQUEST)
              .jsonp(error.details[0].message);
  }
  /*IF USER ALREADY EXIST && RefreshToken not expired {PENDING}
                STATUS_CODE = 409 (CONFLICT)
  */
  user = await doesUserExist(value.email);
  if(user != undefined){
    //console.log("Old User : "+user.os);
    let refreshToken = user.refreshToken; //current refreshtoken saved in db.
    if(refreshToken == undefined){
      //execution should never reach here....
      return res.status(process.env.CONFLICT).jsonp("Unknown");
    }
    if(value.refreshToken != undefined){
      console.log("LOGIN : " +value.refreshToken);
      if(recievedRefreshValid(value.refreshToken)){
          console.log("No its Valid");
      }
      if(isRefreshTokenExpired(value.refreshToken) && recievedRefreshValid(value.refreshToken)){
        currentRefreshInDB = refreshToken;
        if(!isRefreshTokenExpired(refreshToken , res)){
          return res.status(process.env.OK).jsonp({"refreshToken" : currentRefreshInDB});
        }
        else{
          user.refreshToken = undefined;
          let tokens = prepareTokens(user.email);
          user.refreshToken = tokens.refreshToken;
          await userModel.findOneAndUpdate({"email" : user.email} , {"refreshToken" : user.refreshToken});
          return res.status(process.env.CREATED).jsonp(tokens);
        }
      }
      console.log("Oh Oh");
    }
    else{
      console.log("Refresh not der...");
      return res.status(process.env.BADREQUEST).send("Fall Back");
    }
    
  }
  else{
    //console.log("New User");
    let tokens = prepareTokens(value.email);
    value.refreshToken = tokens.refreshToken;
    if(await addNewUser(value)){return res.status(process.env.CREATED).jsonp(tokens);}
    else{
      //check database
      return res.status(process.env.SERVER_ERROR).send("Unknown");
    }
  }
  return res.status(process.env.BADREQUEST).send("Fall Back");
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

function isRefreshTokenExpired(refreshToken , res){

  let isExpired = false;
  try{
    jwt.verify(refreshToken , process.env.REFRESHTOKEN_SECRET);
    console.log("Not Expired..");
  }
  catch(err){
    if(err.name == process.env.TOKEN_EXP_ERROR){
      console.log("Expired..");
      return true;
    }
    else if(err.name == process.env.TOKEN_JWT_ERROR){
      //execution should necver reach here.... 
      //which means we are storing wrong refresh token inside DB
      return res.status(process.env.CONFLICT).send("Error Processing request");
    }
  }

  return isExpired;

}

function recievedRefreshValid(refreshToken){
  let isValid = true;
  try{
    jwt.verify(refreshToken , process.env.REFRESHTOKEN_SECRET);
    console.log("Valid");
  }
  catch(err){
   if(err.name == process.env.TOKEN_JWT_ERROR){
     console.log("Invalid");
      return false;
    }
    console.log("Unknown..");
  }

  return isValid;
}


function prepareTokens(email){
  let access_token = jwt.sign({'email' : email} , 
    process.env.ACCESSTOKEN_SECRET,
   { expiresIn: process.env.ACCESSTOKEN_EXP_TIME });
  let refresh_token = jwt.sign({'email' : email }, 
    process.env.REFRESHTOKEN_SECRET, 
    { expiresIn: process.env.REFRESHTOKEN_EXP_TIME});

  return {"accessToken" : access_token , "refreshToken" : refresh_token};
}

async function updateRefreshToken(user){
  await userModel.findOneAndUpdate({"email" : user.email} , {"refreshToken" : user.refreshToken});
  return;
}

async function addNewUser(user){

  newUser = new userModel(user); 
  let isAdded = await newUser.save()
                            .then(
                              user => {
                                return true;
                              })
                            .catch(
                              err =>{
                                return false;
                            });
  
  return isAdded;

}


module.exports = router;
