'use strict';

var server = require('server');

var base = module.superModule;

server.extend(base);

const Logger = dw.system.Logger.getLogger("plugin_contactlab", "Order");

server.append('Confirm', function (req, res, next) {

  this.on('route:Start', function (requ, resp) {
    // Retrive Information
    dw.system.Logger.getLogger("MFAB", "Order").error("---> Start Route");

    // Integrity Checks
    var order = OrderMgr.getOrder(req.querystring.ID);
    var token = req.querystring.token ? req.querystring.token : null;

    if (!order
      || !token
      || token !== order.orderToken
      || order.customer.ID !== req.currentCustomer.raw.ID
    ) {
      Logger.error("Unable to find OrderId and/or Order Token", req.querystring.ID, token);
      return next();
    }
    var lastOrderID = Object.prototype.hasOwnProperty.call(req.session.raw.custom, 'orderID') ? req.session.raw.custom.orderID : null;
    if (lastOrderID === req.querystring.ID) {
      Logger.error("Order ID do not match with session: {0}/{1}", lastOrderID, req.querystring.ID, token);
      return next();
    }
    //
    Logger.error("Found order {0}. Go next()", order.orderNo);
    return next();
  });

  this.on('route:Complete', function (requ, resp) {
    // Retrive Information
    dw.system.Logger.getLogger("MFAB", "Order").error("---> End Route");
  });

  next();
});


module.exports = server.exports();