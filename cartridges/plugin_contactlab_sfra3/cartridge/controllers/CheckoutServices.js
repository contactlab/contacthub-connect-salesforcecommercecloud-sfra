'use strict';

var server = require('server');
var base = module.superModule;
server.extend(base);

const Logger = dw.system.Logger.getLogger("plugin_contactlab", "CheckoutServices");

server.append('PlaceOrder', function (req, res, next) {
  this.on('route:Complete', function (req, res) {
    // Retrive Information
    let viewData = res.getViewData();
    if (! viewData.error) {
      let myorder = dw.order.OrderMgr.getOrder(viewData.orderID);
      if (! empty(myorder)) {
        if (myorder.customer.registered) {
          Logger.info("O# {0}: Send to ContactLab [start]", myorder.orderNo);
          let customerID = myorder.customer.profile.customerNo;
          const events = require('plugin_contactlab/cartridge/scripts/CHEvents');
          events.sendCompletedOrder(customerID, myorder);
          Logger.info("O# {0}: Send to ContactLab [done]", myorder.orderNo);
        } else {
          Logger.info("O# {0}: Guest order. Skip", myorder.orderNo);
        }

      } else {
        Logger.error("Unable to load O# {0}. Error", viewData.orderID);
      }
    }
  });
  next();
});

module.exports = server.exports();