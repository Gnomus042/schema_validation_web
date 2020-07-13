$('#shapes-type-select').change(() => {
    $('.shex-specific').toggleClass('d-sm-none');
});

$('#input-type-select').change(() => {
    $('.inputs>div').toggleClass('d-sm-flex');
    $('.inputs>div').toggleClass('d-sm-none');
});

function changeFileInputLabel(inputId) {
    let file = $(inputId).get(0).files[0];
    $(`label[for=${inputId.substr(1)}]`).text(file.name);
}

$('#shapes-input-file').change(() => changeFileInputLabel('#shapes-input-file'));
$('#schema-input-file').change(() => changeFileInputLabel('#schema-input-file'));

function readTextFromFile(elementId) {
    let resolver;
    let promise = new Promise((res, rej) => {
        resolver = res
    });
    let onReaderLoad = (event) => {
        resolver(event.target.result);
    };
    let file = $(elementId).get(0).files[0];
    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(file);
    return promise;
}

function stringToUrl(str) {
    var blob = new Blob([str], {type: 'text/plain'});
    return window.URL.createObjectURL(blob);
}

function validateShex(shapes, data) {
    let dataId = $('#data-id').val();
    let startShape = $('#start-shape').val();
    let shapesUrl = stringToUrl(shapes);
    let dataUrl = stringToUrl(data);

    shex.validate(dataUrl, shapesUrl, dataId, startShape)
        .then(res => {
            let result = {conforms: true};
            if (res.errors !== undefined) {
                result.conforms = false;
                result.errors = res.errors;
            }
            $('.report').text(JSON.stringify(result, undefined, 2));
        })
        .catch(err => console.log(err + "\n" + err.stack));
}

function validateShacl(shapes, data) {
    shacl.validate(data, shapes)
        .then(res => $('.report').text(JSON.stringify({conforms: res.conforms, results: res.results}, undefined, 2)))
        .catch(err => $('.report').text("Error: " + err));
}

$('#validate-btn').on('click', () => {
    if ($('#input-type-select').val() === "text") {
        let shapes = $("#shapes-input").val();
        let data = $("#schema-input").val();
        $('#shapes-type-select').val() === "shex" ? validateShex(shapes, data) : validateShacl(shapes, data);
    } else {
        Promise.all([readTextFromFile('#shapes-input-file'), readTextFromFile('#schema-input-file')])
            .then(values => {
                let shapes = values[0];
                let data = values[1];
                $('#shapes-type-select').val() === "shex" ? validateShex(shapes, data) : validateShacl(shapes, data);
            });
    }
});