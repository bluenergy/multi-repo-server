$(document)
    .ready(function() {
        $('.ui.dropdown').dropdown(
            {
                onChange: function () {
                    if ($('input')[0].value && $('input')[1].value && $('input')[2].value) {
                        $('.ui.error.message').hide();
                    }
                }
            }
        );
        $('.submit').on('click',
            function () {
                if ($('input')[0].value && $('input')[1].value && $('input')[2].value) {
                    $.post({
                        url: 'deploy',
                        data: JSON.stringify({
                            project: $('input')[0].value,
                            branch: $('input')[1].value,
                            env: $('input')[2].value,
                        }),
                        contentType: "application/json;charset=utf-8",
                        success: function () {
                            console.log('部署完成');
                        }
                    });
                } else {
                    $('.ui.error.message').show();
                }
            }
        )
    })
;