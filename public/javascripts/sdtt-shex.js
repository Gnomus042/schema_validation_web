// TODO massive refactoring

const shexURL = location + "full.shex";

$("#context").change(() => changeContext());

function changeContext() {
    let context = $("#context").val();
    $(".shex-preview>h2>span").text(context);
    $.get(`specific/${context}.shex`, res => {
        $(".shex-shapes").text(res);
    });
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
    window.location.replace(window.location + "full.shex");
});
