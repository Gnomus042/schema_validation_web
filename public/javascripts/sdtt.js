const shexURL = location + "shex/full.shex";
let context;
let tests;

let wrapperErrors = document.getElementById("errors");
let wrapperWarnings = document.getElementById("warnings");

$.get('shex/context.json', data => {
    context = data;
});

$(document).bind('keypress', function(e) {
    if(e.keyCode===13){
        $("#validate-btn").click();
    }
});

$(document).ready(() => {
    $.get('sdtt/tests', data => {
        tests = data;
        let testsBlock = $('.tests');
        tests.forEach(test => testsBlock.append(
            `<div class="test btn btn-light" onclick="setTest('${test.link}')">Test ${test.id}</div>`
        ));
    });
});

function setTest(testLink) {
    $.get(testLink, data => {
        $("#text-data-input").val(JSON.stringify(data, undefined, 2))
    }).then(err => console.log(err));
}


$(document).delegate('#text-data-input', 'keydown', function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 9) {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        $(this).val($(this).val().substring(0, start)
            + "\t"
            + $(this).val().substring(end));

        // put caret at right position again
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

$("#validate-btn").on('click', () => {
    getInput()
        .then((data) => {
            data = JSON.parse(data);
            if (data["@id"] === undefined) {
                alert("Please add the @id field");
                return;
            } else if (data["@type"] !== "Recipe") {
                printResults(["@type is not Recipe"], []);
                return;
            }
            data['@context'] = context;
            let dataId = data["@id"];
            let dataURL = stringToUrl(JSON.stringify(data));
            let orgContext = $("#context").val();
            let errors = validation.validateShEx(dataURL, shexURL, dataId, `http://schema.org/shex#${orgContext}Recipe`, true);
            let warnings = validation.validateShEx(dataURL, shexURL, dataId, `http://schema.org/shex#${orgContext}RecipeStrict`, true);
            Promise.all([errors, warnings]).then(res => {
                printResults(...res);
            })
        });
});

function printResults(errors, warnings) {
    $(".results-wrapper").removeClass('d-sm-none');
    $("#conforms").text(errors.length === 0);
    $("#errors-count").text(errors.length);
    $("#warnings-count").text(warnings.length);
    //jsonTree.create(errors, wrapperErrors);
    //jsonTree.create(warnings, wrapperWarnings);
    $("#errors").text(errors.join('\n'));
    $("#warnings").text(warnings.join('\n'));
}

$("#shex-btn").on('click', () => {
   window.location.replace(window.location  + "/shex/full.shex");
});
