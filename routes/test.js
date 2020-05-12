const express = require('express');
const router = express.Router();
const joi =  require('@hapi/joi');

const schema = joi.object({
    g : joi.number().required(),
    a: joi.string().required()
}); 

router.post('/' , function(req, res, next) {
    const{value , error} = schema.validate(req.body);
    let result = "All is well";
    if(error){
        result = error.details[0].message
    }
    res.send(error);
});


module.exports = router;