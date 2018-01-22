$(document).ready(function() {
	$("#delete-img").on("click", function(event) {
		event.preventDefault();
		$(event.target).parent().find('img').remove();
		$(event.target).remove();
		$('#delete-input').val("true");
	});
});