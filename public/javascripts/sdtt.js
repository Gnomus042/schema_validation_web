const shexURL = location + "shex/full.shex";

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
        resolver($("text-data-input").val());
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
            let dataId = data["@id"];
            let dataURL = stringToUrl(JSON.stringify(data))
            let errors = validation.validateShEx(dataURL, shexURL, dataId, "http://schema.org/shex#GoogleRecipe");
            let warnings = validation.validateShEx(dataURL, shexURL, dataId, "http://schema.org/shex#GoogleRecipeStrict");
            Promise.all([errors, warnings]).then(res => {
                printResults(res[0], res[1]);
            })
        })
        .catch(err => console.log("getInput() error: " + err));
});

function printResults(errors, warnings) {
    $(".results-wrapper").removeClass('d-sm-none');
    $("#conforms").text(errors.length + warnings.length === 0);
    $("#errors-count").text(errors.length);
    $("#warnings-count").text(warnings.length);
    $("#errors").text(JSON.stringify(errors, undefined, 2));
    $("#warnings").text(JSON.stringify(warnings, undefined, 2));
}
