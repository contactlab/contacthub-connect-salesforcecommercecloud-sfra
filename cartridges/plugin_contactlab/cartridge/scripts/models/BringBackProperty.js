'use strict';

var BringBackProperty = function() {
    var _this = this;
};


/**
 * type of bring back
 * @member {module:model/BringBackProperty.TypeEnum} type
 * @default 'SESSION_ID'
 */
BringBackProperty.prototype['type'] = 'SESSION_ID';
/**
 * value of bring back
 * @member {String} value
 */
BringBackProperty.prototype['value'] = undefined;
/**
 * id of entry node
 * @member {String} nodeId
 */
BringBackProperty.prototype['nodeId'] = undefined;


/**
 * Allowed values for the <code>type</code> property.
 * @enum {String}
 * @readonly
 */
BringBackProperty.TypeEnum = {
    /**
     * value: "SESSION_ID"
     * @const
     */
    "SESSION_ID": "SESSION_ID",
    /**
     * value: "EXTERNAL_ID"
     * @const
     */
    "EXTERNAL_ID": "EXTERNAL_ID"
};
