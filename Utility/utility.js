const jwt = require('jsonwebtoken');

module.exports = {
 
    verifyToken : function(token , secret){
        let statusCode = process.env.OK;
        let isGood = true
        
        try {
            jwt.verify(token , secret);
        }
        catch (err) 
        { 
            statusCode = process.env.BADREQUEST;
            console.log(err.name);
            if(err.name == process.env.TOKEN_EXP_ERROR){
                console.log("Token Expired")
                statusCode = process.env.FORBIDDEN;
            }
            isGood = false;
        }
    
        return {isGood , statusCode};
    }
    
}