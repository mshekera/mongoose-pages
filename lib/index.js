
exports.anchor = function (schema, anchorField, compOp) {
    schema.statics.findPaginated = require('./anchor.js')(anchorField, compOp);
}

exports.skip = function (schema) {
    schema.statics.findPaginated = require('./skip.js');
}
