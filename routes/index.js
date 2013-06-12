var data = require('../data.js');

var db = data();

/*
 * GET home page.
 */

exports.index = function(req, res){
	return db.get('git-server', function(err, doc){
		if (err) {
			console.log(err);
			res.render('index', {server: null, 'settings': null});
		} else {
			return db.get('settings', function (err, docTwo){
				if(err) {
					console.log(err);
					res.render('index', {server: null, 'settings': null});
				} else {
					res.render('index', {'server': doc, 'settings': docTwo});
				}
			});
		}
	});
};