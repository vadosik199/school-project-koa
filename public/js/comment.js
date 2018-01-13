$(document).ready(function() {
    var form = $('#comment-form');
    form.on('submit', function(event) {
        event.preventDefault();
        var body = {};
        body.postId = $(form).find('input[type="hidden"]').val();
        body.text = $('#usercomment').val();
        if($('#username').val() != undefined && $('#useremail').val() != undefined) {
            body.username = $('#username').val();
            body.useremail = $('#useremail').val();
        }
        $.ajax({
            url: '/posts/comments/add',
            method: 'POST',
            data: body,
            success: function(data) {
                console.log(data);
            }
        })
    });
});