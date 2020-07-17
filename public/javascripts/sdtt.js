const shexURL = location + "shex/full.shex";
let context;
let tests;

$.get('shex/context.json', data => {
    context = data;
});

$(document).ready(() => {
    $.get('sdtt/tests', data => {
        tests = data;
        let testsBlock = $('.tests');
        tests.forEach(test => testsBlock.append(
            `<div class="test btn btn-light" onclick="setTest('${test.link}')">Test ${test.id}</div>`
        ));
    });
})

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
            }
            data['@context'] = context;
            let dataId = data["@id"];
            let dataURL = stringToUrl(JSON.stringify(data))
            let errors = validation.validateShEx(dataURL, shexURL, dataId, "http://schema.org/shex#GoogleRecipe");
            let warnings = validation.validateShEx(dataURL, shexURL, dataId, "http://schema.org/shex#GoogleRecipeStrict");
            Promise.all([errors, warnings]).then(res => {
                let errors = simplifyResult(res[0]);
                let warnings = simplifyResult(res[1]);
                printResults(res[0], res[1]);
            })
        });
});

function removeUrl(url) {
    let slashIdx = url.lastIndexOf("/");
    return url.substr(slashIdx+1);
}

function simplifyResult(result) {
    if (result.errors) {
        let errors = [];
        result.errors.forEach(err => {
            errors = errors.concat(simplifyResult(err));
        });
        return errors;
    }
    return [result]
}

function printResults(errors, warnings) {
    $(".results-wrapper").removeClass('d-sm-none');
    $("#conforms").text(errors.length + warnings.length === 0);
    $("#errors-count").text(errors.length);
    $("#warnings-count").text(warnings.length);
    $("#errors").text(JSON.stringify(errors, undefined, 2));
    $("#warnings").text(JSON.stringify(warnings, undefined, 2));
}

$("#shex-btn").on('click', () => {
   window.location.replace(window.location  + "/shex/full.shex");
});
