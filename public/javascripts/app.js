$(document).ready(function(){
	var ref = {};
	ref.cm = CodeMirror(document.body, {
	  value: document.getElementById('content').innerHTML,
	  mode:  "javascript",
	  theme: "monokai",
	  lineNumbers: true
	});

	var revert = $('.revert'),
	save = $('.save');

	revert.click(function(){
		$('.CodeMirror').remove();
		ref.cm = CodeMirror(document.body, {
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