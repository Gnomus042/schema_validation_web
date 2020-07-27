// TODO massive refactoring

const shexURL = location + "shex/full.shex";
let context;
let tests;

$.get('shex/context.json', data => {
    context = data;
});

$(document).bind('keypress', function (e) {
    if (e.keyCode === 13) {
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

$("#context").change(() => changeContext());

function changeContext() {
    let context = $("#context").val();
    $(".shex-preview>h2>span").text(context);
    $.get(`shex/specific/${context}.shex`, res => {
        $(".shex-shapes").text(res);
    });
}

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
                // ugly duplicates removal
                errors = [...new Set(res[0].map(JSON.stringify))];
                warnings = [...new Set(res[1].map(JSON.stringify))];
                errors.forEach(err => {
                   if (warnings.indexOf(err) > -1) {
                       warnings.splice(warnings.indexOf(err), 1);
                   }
                });
                printResults(errors.map(JSON.parse), warnings.map(JSON.parse));
            })
        });
});

function parseType(type) {
    var result = type.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}

function resToHtml(res) {
    let prop = validation.clearURL(res.property);

    let html = `<div class="result-item">
            <div class="head">
                <div>${parseType(res.type)}: ${prop}</div>
            </div>
            <div>
                ${res.possibleOptions? `Possible values: ${res.possibleOptions.join()}`:""}
                ${res.description? `Description: ${res.description}`: ""}
                ${res.url? `<a href="${res.url}">Documentation</a>`:""}
            </div>
        </div>`;
    return html;
}

function printResults(errors, warnings) {
    $(".results-wrapper").removeClass('d-sm-none');
    $("#conforms").text(errors.length === 0);
    $("#errors-count").text(errors.length);
    $("#warnings-count").text(warnings.length);
    $("#errors").empty();
    $("#warnings").empty();
    errors.forEach(err => {
        $("#errors").append(resToHtml(err));
    });
    warnings.forEach(warn => {
        $("#warnings").append(resToHtml(warn));
    });
    //$("#errors").text(errors.map(x => JSON.stringify(x, undefined, 2)).join('\n'));
    //$("#warnings").text(warnings.map(JSON.stringify(x, undefined, 2)).join('\n'));
}

$("#shex-btn").on('click', () => {
    window.location.replace(window.location + "/shex/full.shex");
});
