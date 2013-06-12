var data = require ('../data.js')
	, fs = require('fs')
	, execSync = require('exec-sync')
	, git = require('gitty')
	, GitHubApi = require("github")
	, SendGrid = require('sendgrid-nodejs').SendGrid
	, appSettings = require('../settings.js');

var sendgrid = new SendGrid(appSettings.sendGrid().userName, appSettings.sendGrid().password);

var github = new GitHubApi({
    version: "3.0.0"
});

var db = data();
var myRepo;

var _callback = '';

var settings = {
	'folderOne' : '',
	'folderTwo' : '',
	'gitCloneUrl' : '',
	'serverName' : '',
	'isAutoDeployOn': false,
	'currentFolder' : 'none',
}

function contDeployStart () {
	var firstTime = false;
	if (!settings['currentFolder'] || settings['currentFolder'] === 'none') {
		gitClone(settings['folderOne']);
		firstTime = true;
		console.log('hack around gitty clone bugs');
		setTimeout(function() {
			var cmd = 'PORT=3010 forever start ' + settings['folderOne'] + '/app.js';
			console.log('cmd: ' + cmd);
			execSync(cmd);
			settings['currentFolder'] = settings['folderOne'];
			github.getReposApi().getCommits({user: 'ograycode', repo: 'modevhackathon2013'}, function (err, response){
				if (err) {
					console.log('error:' + err);
				} else {
					console.log(response);
					var sha = response[0]['sha'];
					settings['sha'] = sha;
					db.merge('settings', {'sha' : sha }, function (err, results) {
						if (err)
							console.log(err);
						else 
							console.log(results);
					});
				}
			});
			db.merge('settings', {'currentFolder': settings['currentFolder']}, function(err, results){
				if (err)
					console.log(err);
				else
					console.log(results);
			});

			_callback(null, 'success');

		}, 2000);
	} else {
		console.log('checking for updates');
		checkForUpdates();
	}

}

function checkForUpdates() {
	github.getReposApi().getCommits({user: 'ograycode', repo: 'modevhackathon2013'}, function (err, response){
		if (err)
			console.log('error:' + err);
		else
			console.log(response);
		if (response[0].sha !== settings['sha']) {
			console.log('FOUND AN UPDATE');
			settings['sha'] = response[0].sha;
			executeUpdate();
		}
	});
}

function executeUpdate () {
	var newFolder = '';
	var newPort = '';
	var oldFolder = settings['currentFolder'];
	if (settings['currentFolder'] === settings['folderOne']) {
		newFolder = settings['folderTwo'];
		newPort = '3005';
	} else {
		newFolder = settings['folderOne'];
		newPort = '3010';
	}
	try {
		execSync('rm -r ' + newFolder);
	} catch (err) {
		console.log('error deleting folder ' + newFolder + '; error ' + err);
	}

	gitClone(newFolder);

	console.log('hack around gitty clone bugs');
	setTimeout(function() {;
		var cmd = 'PORT=' + newPort +' forever start ' + newFolder + '/app.js';
		console.log('cmd: ' + cmd);
		execSync(cmd);
		settings['currentFolder'] = newFolder;

		sendgrid.send({
		  to: 'jason.alan.gray@gmail.com',
		  from: 'audit@project-narwhal.com',
		  subject: 'Narwhal App was Updated',
		  text: 'Your application with Project Narwhal has been updated to sha: ' + settings['sha']
		}, function(success, message) {
		  if (!success) {
		    console.log(message);
		  }
		});

		db.merge('settings', {'currentFolder': settings['currentFolder'], 'sha' : settings['sha']}, function(err, results){
			if (err) {
				console.log(err);
				_callback(err, null)
			 } else {
				console.log(results);
			}
			try {
				execSync('forever stop ' + oldFolder + '/app.js');
			} catch (err) {
				console.log('error in stoping forever err ' + err);
			}

			_callback(null, 'success');

		});
	}, 2000);
}

function gitClone (folder) {
	git.clone(folder, settings['gitCloneUrl'], function(repos, err, res){
		if (err)
			console.log(err);
		else
			console.log(res);
	});
}

function startServer (path) {
}

function ensureExists (path) {
	var exists = fs.existsSync(path)
	if (!exists) {
		fs.mkdirSync(path);
	}
}

module.exports = {
	'start' : function(callback) {
		_callback = callback
		db.get('settings', function(err, doc){
			if (err) {
				console.log(err);
				_callback(err, null);
			} else {
				if (doc.isAutoDeployOn === 'true') {
					db.get('git-server', function(err, docServ){
						if (err) {
							console.log(err);
							_callback(err, null);
						} else {
							settings['folderOne'] = doc['folderOne'];
							settings['folderTwo'] = doc['folderTwo'];
							settings['isAutoDeployOn'] = doc['isAutoDeployOn'];
							settings['serverName'] = docServ['name'];
							settings['gitCloneUrl'] = docServ['server'];
							settings['currentFolder'] = doc['currentFolder'];
							settings['sha'] = doc['sha'];
							console.log('Starting....')
							contDeployStart();
						}
					});
				}
			}
		});
	}
}