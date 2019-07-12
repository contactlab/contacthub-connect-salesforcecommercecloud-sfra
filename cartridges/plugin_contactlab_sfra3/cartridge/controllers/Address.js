'use strict';

var server = require('server');
var account = module.superModule;
server.extend(account);

const Logger = dw.system.Logger.getLogger("plugin_contactlab_sfra3", "Account");

server.append('SaveAddress', function (req, res, next) {
  const ContactHUBCustomer = require('plugin_contactlab/cartridge/scripts/CHCustomers');

  this.on('route:Complete', function (req, res) {
    // TODO Check Success
    Logger.debug("[SaveAddress] Done")
    let viewData = res.getViewData();

    if ((viewData.success) && (! empty(req.currentCustomer)) && (! empty(req.currentCustomer.profile.email))) {
      Logger.info("[SaveAddress] Sync ContactHub profile for {0}", req.currentCustomer.profile.email)
      let myCustomer = dw.customer.CustomerMgr.getCustomerByLogin(req.currentCustomer.profile.email);
      // If found send data to Hub
      if (! empty(myCustomer)) {
        ContactHUBCustomer.syncProfile(myCustomer.profile);
      } else {
        Logger.error("[SaveAddress] Customer login {0} NOT Found. Cannot update on ContactHub", email);
      }

    }
    Logger.debug("[SaveAddress] Done")
  });

  next();
});

module.exports = server.exports();