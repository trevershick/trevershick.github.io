var $=window.jQuery;
function showCode(preElement) {
	var i = $("<pre/>").html(preElement.html());
	var d = $("<div class='highlight'/>").append(i);
	d.dialog({ show: {effect: 'fade', speed: 500},width: '90%', title:$(this).attr("alt")});
}
jQuery(function(){
	$("pre").each(function() {
		var p = $(this);
		$(this).before(
			$("<div class='code-preview'><a class='code-preview'>view</a></div>").click(function(){ showCode(p); })
			);
	});
	$("img").each(function(){
		$(this).css("cursor","pointer");
	});
	$("body").delegate("img","click", function() {
		var i = $("<img/>").attr("src", $(this).attr("src"));
		var d = $("<div/>").append(i);
		d.dialog({ show: {effect: 'fade', speed: 500}, width: 'auto',title:$(this).attr("alt")});
	});
});
