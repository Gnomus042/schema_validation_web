let shaclShapes;

$.get('full.shacl', data => {
    shaclShapes = data;
});

$('#validate-btn').on('click', () => {
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
            let errors = [];
            let warnings = [];
            let report = validation.validateShacl(JSON.stringify(data), shaclShapes).then(report => {
                report.results.forEach(res => {
                    let str = `${validation.clearURL(res.path.value)}: ${res.message.map(x => x.value).join('\n')}`;
                    if (validation.clearURL(res.severity.value) === "Violation") {
                        errors.push(str);
                    } else {
                        warnings.push(str);
                    }
                });
                printResults(errors, warnings);
            })
        })
});



function printResults(errors, warnings) {
    $(".results-wrapper").removeClass('d-sm-none');
    $("#conforms").text(errors.length === 0);
    $("#errors-count").text(errors.length);
    $("#warnings-count").text(warnings.length);
    $("#errors").text(errors.join('\n'));
    $("#warnings").text(warnings.join('\n'));
}

$("#shacl-btn").on('click', () => {
    window.location.replace(window.location + "full.shacl");
});
