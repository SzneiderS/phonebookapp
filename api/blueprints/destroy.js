var _ = require('@sailshq/lodash');

module.exports = function destroyOneRecord(req, res) {
    var parseBlueprintOptions = req.options.parseBlueprintOptions || req._sails.config.blueprints.parseBlueprintOptions;

    // Set the blueprint action for parseBlueprintOptions.
    req.options.blueprintAction = 'destroy';

    var queryOptions = parseBlueprintOptions(req);
    var Model = req._sails.models[queryOptions.using];

    var criteria = {};
    criteria[Model.primaryKey] = queryOptions.criteria.where[Model.primaryKey];

    var query = Model.findOne(_.cloneDeep(criteria), queryOptions.populates).meta(queryOptions.meta);
    query.exec(function foundRecord(err, record) {
        if (err) {
            // If this is a usage error coming back from Waterline,
            // (e.g. a bad criteria), then respond w/ a 400 status code.
            // Otherwise, it's something unexpected, so use 500.
            switch (err.name) {
                case 'UsageError': return res.badRequest(err.message);
                default: return res.serverError(err);
            }
        }//-•

        if (!record) { return res.notFound('No record found with the specified `id`.'); }

        Model.destroy(_.cloneDeep(criteria)).meta({ fetch: true }).exec(function destroyedRecord(err) {
            if (err) {
                switch (err.name) {
                    case 'UsageError': return res.badRequest(err.message);
                    default: return res.serverError(err);
                }
            }//-•
            return res.ok(record);
        });
    });
};