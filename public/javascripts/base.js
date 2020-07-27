let context;
let tests;

$(document).bind('keypress', function (e) {
    if (e.keyCode === 13) {
        $("#validate-btn").click();
    }
});

$.get('context.json', data => {
    context = data;
});

$(document).ready(() => {
    $.get('/sdtt/tests', data => {
        tests = data;
        let testsBlock = $('.tests');
        tests.forEach(test => testsBlock.append(
            `<div class="test btn btn-light" onclick="setTest('${test.link}')">Test ${test.id}</div>`
        ));
    });
    changeContext();
});

function setTest(testLink) {
    $.get(testLink, data => {
        $("#text-data-input").val(JSON.stringify(data, undefined, 2))
    }).then(err => console.log(err));
}


$(document).delegate('#text-data-input', 'keydown', function (e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9) {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        $(this).val($(this).val().substring(0, start)
            + "\t"
            + $(this).val().substring(end));

        this.selectionStart =
            this.selectionEnd = start + 1;
    }
});

$("#input-type").change(() => {
    $('.inputs').toggleClass('d-sm-none');
});

$("#file-data-input").change(() => {
    let file = $("#file-data-input").get(0).files[0];
    $('label[for=file-data-input]').text(file.name);
});

function stringToUrl(str) {
    var blob = new Blob([str], {type: 'text/plain'});
    return window.URL.createObjectURL(blob);
}

function readTextFromFile(file) {
    let resolver;
    let promise = new Promise((res, rej) => {
        resolver = res
    });
    let onReaderLoad = (event) => {
        resolver(event.target.result);
    };
    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);
    return promise;
}

function getInput() {
    if ($("#input-type").val() === "text") {
        let resolver;
        let promise = new Promise((res, rej) => resolver = res);
        resolver($("#text-data-input").val());
        return promise;
    }
    let file = $("#file-data-input").get(0).files[0];
    return readTextFromFile(file);
}