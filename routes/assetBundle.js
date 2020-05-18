const express = require('express');
const router = express.Router();
const path = require('path');

let androidBundleDir = "/Android/";

router.get('/Android/*' , function(req, res , next){
    
    let bundle = req.path.slice(androidBundleDir.length , req.path.length);
    let basePath = "../gameAssets/bundles/Android/"+bundle;
    console.log(bundle);
    console.log(path.join(__dirname,basePath))
    res.download( path.join(__dirname,basePath) );
});
router.post('/Android/*' , function(req, res , next){
    
    let bundle = req.path.slice(androidBundleDir.length , req.path.length);
    let basePath = "../gameAssets/bundles/Android/"+bundle;
    console.log(bundle);
    console.log(path.join(__dirname,basePath))
    res.download( path.join(__dirname,basePath) );
});

module.exports = router;