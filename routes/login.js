const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi =  require('@hapi/joi');

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

  email : joi.string().alphanum().email().required(),
  deviceModel : joi.string().alphanum().optional(),
  os : joi.string().alphanum().optional()

})

router.post('/' , function(req, res, next) {

  if(!areParametersValid(req)){ 
    res.status(process.env.BADREQUEST).send("Invalid Parameters"); 
  }
  if(Object.keys(req.body).length > 3){ 
    res.status(process.env.UNPROCESSABLE).send("TOO MANY PARAMETERS");
   }

  let postParameters = populatePostParameters(req);

  res.status(process.env.OK).jsonp(postParameters);

});


function areParametersValid(req)
{
  let result = false;
  if(req.body.hasOwnProperty(process.env.EMAIL)){
    result = true; 
  }
  return result;
}

function populatePostParameters(req){
  let result = {};

  if(req.body.hasOwnProperty(process.env.EMAIL)){
    result.email = req.body.email; 
  }
  else{ res.status(process.env.BADREQUEST).send("Invalid Parameters");}

  if(req.body.hasOwnProperty(process.env.DEVICEMODEL)){
    result.deviceModel = req.body.deviceModel; 
  }
  else{result.deviceModel = undefined;}

  if(req.body.hasOwnProperty(process.env.OPERATING_SYS)){
    result.os = req.body.os; 
  }
  else{result.os = undefined;}
  

  return result;
}

module.exports = router;
