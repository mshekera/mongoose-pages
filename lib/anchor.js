module.exports = function (conditions, fields, options, callback, limit, anchorId) {
        
    var model = this;

    // re-assign params
    if ('function' == typeof conditions) {
        limit = fields;
        anchorId = options;
        callback = conditions;
        conditions = {};
        fields = null;
        options = {};

    } else if ('function' == typeof fields) {
        limit = options;
        anchorId = callback;
        callback = fields;
        fields = null;
        options = {};

    } else if ('function' == typeof options) {
        anchorId = limit;
        limit = callback;
        callback = options;
        options = {};

    }

    var anchorField = '_id',
        compOp = '$gt',
        i, len, props, val;

    // if any straight forward sort condition exists -
    // should use first of 'em as anchorField
    if (typeof options.sort === 'object') {
        props = Object.getOwnPropertyNames(options.sort);
        for (i = 0, len = props.length; i < len; i++ ) {
            val = options.sort[props[i]];

            if (typeof val === 'string' || typeof val === 'number') {
                anchorField = props[i];
                compOp = val == 1 ? '$gt' : '$lt';
                break;
            }
        }
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

};