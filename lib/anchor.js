module.exports = function (anchorField, compOp) {
    anchorField = typeof anchorField === 'string' && anchorField || '_id';
    if ( ['$gt', '$lt', '$gte', '$lte'].indexOf(compOp) === -1 ) {
        compOp = '$gt';
    }

    return function (conditions, fields, options, callback, limit, anchorId) {

        var model = this;

        // re-assign params
        if ('function' == typeof conditions) {
            //console.log('A');
            limit = fields;
            anchorId = options;
            callback = conditions;
            conditions = {};
            fields = null;
            options = {};

        } else if ('function' == typeof fields) {
            //console.log('B');
            limit = options;
            anchorId = callback;
            callback = fields;
            fields = null;
            options = {};

        } else if ('function' == typeof options) {
            //console.log('C');
            anchorId = limit;
            limit = callback;
            callback = options;
            options = {};

        }

        // set pagination filters
        if (anchorId) {
            conditions[anchorField] = {};
            conditions[anchorField][compOp] = anchorId;
        }
        if (limit) options.limit = limit;

        return model.find(conditions, fields, options, function (err, docs) {

            if (err) {
                return callback(err);
            }
            else {

                var result = {}
                if (docs.length) {

                    result.documents = docs;

                    model.count(conditions, function (err, count) {

                        var totalPages = count;

                        if (limit) result.totalPages = Math.ceil(totalPages / limit);
                        else result.totalPages = 1;

                        if (result.totalPages > 1) {
                            result.prevAnchorId = anchorId;
                            result.nextAnchorId = docs[ docs.length - 1 ][anchorField].toString();
                        }

                        callback(err, result);

                    })

                }
                else {
                    result.documents = [];
                    result.totalPages = 0;
                    callback(err, result);
                }

            }

        })


    }
};