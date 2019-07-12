'use strict';

var PostCustomer = function(baseProperty) {
    var _this = this;
    _this['base'] = baseProperty;
};

/**
 * the external id of customer
 * @member {String} externalId
 */
PostCustomer.prototype['externalId'] = undefined;
/**
 * entry node `id`
 * @member {String} nodeId
 */
PostCustomer.prototype['nodeId'] = undefined;
/**
 * properties predefined in contacthub in base to the model retrived in /models/properties/base
 * @member {Object} base
 */
PostCustomer.prototype['base'] = undefined;
/**
 * custom data defined by workspace based on a declarated schema
 * @member {Object} extended
 */
PostCustomer.prototype['extended'] = undefined;
/**
 * custom data defined by workspace not based on a declarated schema
 * @member {String} extra
 */
PostCustomer.prototype['extra'] = undefined;
/**
 * @member {module:model/PostCustomerTags} tags
 */
PostCustomer.prototype['tags'] = undefined;
/**
 * flag for soft delete
 * @member {Boolean} enabled
 */
PostCustomer.prototype['enabled'] = undefined;


module.exports = PostCustomer;