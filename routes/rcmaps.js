var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(typeof req.query.latitude == undefined || typeof req.query.longitude == undefined){
		res.send("Require latitude and longitude insde query string");
	}
	if(isNaN(req.query.latitude) || isNaN(req.query.longitude)){
		res.send("Invalid parameter for latitude and longitude");
	}
  	res.render('rcmapui', { latitude: req.query.latitude , longitude: req.query.longitude });
});

module.exports = router;