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
		$.ajax({url:'/api/test',type:'post', data:{js:ref.cm.getValue(), url: url}, dataType:'text'})
		.done(function(resp){
			$('#src').text(resp);
			Prism.highlightAll();
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