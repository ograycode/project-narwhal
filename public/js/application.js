$(function() {

	var newServerForm = {
		isContDeploy : true
	};

	$('#contDeploy').click(function(){
		if (newServerForm['isContDeploy']) {
			newServerForm['isContDeploy'] = false;
			$('#contDeploy').text('Continious Deployment OFF');
			$('#contDeploy').removeClass('btn-success');
			$('#contDeploy').addClass('btn-danger');
		} else {
			newServerForm['isContDeploy'] = true;
			$('#contDeploy').text('Continious Deployment ON');
			$('#contDeploy').removeClass('btn-danger');
			$('#contDeploy').addClass('btn-success');
		}
	});

	$('#new-server-save').click(function(){
		var name = $('#githubname').val();
		var url = $('#githubclone').val();
		$.post('/git', {'name': name, 'url': url}, function(){
			var dep = newServerForm['isContDeploy'];
		    var fOne = $('#folderOne').val();
		    var fTwo = $('#folderTwo').val();
			$.post('/settings', {
				'isAutoDeployOn': dep,
				'folderOne': fOne,
				'folderTwo': fTwo
			}, function () {
				window.location.reload(true);
			});
		});
	});

	$('#new-server-btn').click(function(){
		$('#new-server').modal('show');
	});

	$('#update-btn').click(function(){
		$('body').modalmanager('loading');
		$.get('/test'), function(data) {
			window.location.reload(true);
		}
		setTimeout(function(){
			window.location.reload(true);
		}, 3000);
	});
});