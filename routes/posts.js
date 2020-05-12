var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var jwt_decode = require('jwt-decode')

router.get('/' , function(req , res , next){
    var accessToken = req.header('auth-token');
    if(!accessToken) return res.status(400).send('Nedd Access token to use service');
    console.log(accessToken);
    var user = jwt_decode(accessToken);
    req.body.tokenUser = user;
    jwt.verify(accessToken , process.env.ACCESSTOKEN_SECRET , function(err , payload){

        if(!payload){
            if(err.name == process.env.TOKEN_EXP_ERROR){
                var user = jwt_decode(accessToken);
                req.body.VerefyResult = {'status':"Expired Token..." , 'user':user};
                console.log("sending err");
                return res.send(req.body);
            }
            else if(err.name == process.env.TOKEN_JWT_ERROR){
                req.body.VerefyResult = {'status':"Bad Token..." , 'user':user};
                console.log("sending err");
                return res.send(req.body);
            }
            res.send(err)
            console.log("sending err")
        }
        console.log("sending response");
        return res.status(200).send({'data' : "fss"});
        
    });
    

});

module.exports = router;


