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
			Prism.highlightElement(document.getElementById('src'));
		});
	}



var draggable = function() {
	var $left, $right, $drag, width;
	$left = $('.pageLeft');
	$right = $('.pageRight');
	$drag = $('#drag');
	width = $(window).width();

	$(window).resize(function(){
		var lWidth, rWidth, leftRatio =  $left.width() / ($left.width() + $right.width()), width = $(window).width();
		lWidth =  width * leftRatio;
		rWidth = width - lWidth;
		$left.css('width', lWidth);
		$right.css('width', rWidth);
		$drag.css('left', lWidth);
	});

	var clicking = false;
	var x = 0;
	$drag.on('mousedown touchstart', function(e){
		x = e.pageX;
		clicking = true;
		console.log(e, 'clicking!');
		e.preventDefault();
	});

	$drag.on('mouseup touchend', function(e){
		clicking = false;
		x = 0;
		e.preventDefault();
	});

	$(document).on('mousemove touchmove', function(e) {
		if (clicking) {
			if (e.type == "touchmove") {
				e.pageX = e.originalEvent.touches[0].pageX;
			}

			$drag.css('left', e.pageX);
			$left.css('width', e.pageX);
			$right.css('width', width - e.pageX);
		}
		e.preventDefault();
	});
}
draggable();
	refreshCodeView();

	$('#change-src a').click(function(){
		console.log($(this).data('style'));
		$('#src').removeClass('language-markup').removeClass('language-javascript').addClass($(this).data('style'));
		Prism.highlightElement(document.getElementById('src'));
	});

	revert.click(function(){
		$('.CodeMirror').remove();
		ref.cm = CodeMirror($('.pageLeft')[0], {
		  value: document.getElementById('content').innerHTML,
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