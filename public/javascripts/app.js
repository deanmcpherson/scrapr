$(document).ready(function(){
	var ref = {};
	ref.cm = CodeMirror($('.pageLeft')[0], {
	  value: document.getElementById('content').innerHTML,
	  mode:  "javascript",
	  theme: "monokai",
	  lineNumbers: true
	});

	var revert = $('.revert'),
	save = $('.save'),
	url = $('#url-src').val();
	
	var refreshCodeView = function() {
		$.post('/api/test', {js:ref.cm.getValue(), url: url})
		.done(function(resp){
			try{
				var json = JSON.stringify(resp);
				$('#src').removeClass('')
			}
			catch(e) {
				json = resp;
			}
			$('#src').html('<pre></pre>').find('pre').text(json);
		});
	}

	refreshCodeView();

	revert.click(function(){
		$('.CodeMirror').remove();
		ref.cm = CodeMirror($('.pageLeft')[0], {
		  value: document.getElementById('content').innerHTML,
		  mode:  "javascript",
		  theme: "monokai",
		  lineNumbers: true
		});
	});

	save.click(function(){
		var content = ref.cm.getValue(),
		url = $('#url').val();
		
		$.post(url, {content:content}).done(function(){
			if (res.url) {
				$('#url').val(res.url);
			}
		});
	});
});