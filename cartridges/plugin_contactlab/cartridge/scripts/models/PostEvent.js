'use strict';

var PostEvent = function(type, context, properties) {
    var _this = this;
    _this['type'] = type;
    _this['context'] = context;
    _this['properties'] = properties;
};

/**
 * customer id
 * @member {String} customerId
 */
PostEvent.prototype['customerId'] = undefined;
/**
 * @member {module:model/BringBackProperty} bringBackProperties
 */
PostEvent.prototype['bringBackProperties'] = undefined;
/**
 * the name of type event you are tracking
 * @member {String} type
 */
PostEvent.prototype['type'] = undefined;
/**
 * the name of context event you are tracking. The value are defined in `id` property of method /model/contexts
 * @member {String} context
 */
PostEvent.prototype['context'] = undefined;
/**
 * the json schema related to event type
 * @member {Object} properties
 */
PostEvent.prototype['properties'] = undefined;
/**
 * the json schema related to event context
 * @member {Object} contextInfo
 */
PostEvent.prototype['contextInfo'] = undefined;
/**
 * the timestamp of event
 * @member {Date} date
 */
PostEvent.prototype['date'] = undefined;


module.exports = PostEvent;