$('#shapes-type-select').change(() => {
    $('.shex-specific').toggleClass('d-sm-none');
});

$('#input-type-select').change(() => {
    $('.inputs>div').toggleClass('d-sm-flex');
    $('.inputs>div').toggleClass('d-sm-none');
});

function changeFileInputLabel(inputId) {
    let file = $(inputId).get(0).files[0];
    $(`label[for=${file.name}]`);
}

$('#shapes-input-file').change(() => changeFileInputLabel('#shapes-input-file'));
$('#schema-input-file').change(() => changeFileInputLabel('#schema-input-file'));

function readTextFromFile(elementId) {
    let resolver;
    let promise = new Promise((res, rej) => {resolver = res});
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
        .then(res => $('.report').text(JSON.stringify(res)))
        .catch(err => $('.report').text("Error: " + JSON.stringify(err)));
}

function validateShacl(shapes, data) {

}

$('#validate-btn').on('click', () => {
    let shapes;
    let data;
    if ($('#input-type-select') === "text") {
        shapes = $("#shapes-input").val();
        data = $("#schema-input").val();
    } else {

    }
})