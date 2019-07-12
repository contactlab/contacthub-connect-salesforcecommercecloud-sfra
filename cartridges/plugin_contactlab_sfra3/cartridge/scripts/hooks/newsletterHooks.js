'use strict';

const Logger = dw.system.Logger.getLogger("plugin_contactlab_sfra3", "newsletterHook");


function checkResult(serviceResult) {
    // Check Services Results
    if (serviceResult.isOk()) {
      Logger.error("Service Result Ok")
      return true;
    } else {
      Logger.error("Service Result Fail")
      return false;
    }
}
exports.subscribe = function(email, firstName, lastName) {
  Logger.info("Registering Newsletter. Email: {0}", email)

  const ContactHUBCustomer = require('plugin_contactlab/cartridge/scripts/CHCustomers');
  let myCustomer = dw.customer.CustomerMgr.getCustomerByLogin(email);
  if (! empty(myCustomer)) {
    Logger.info("Subscribe registered user {0} to newsletter", email)
    // Registered Customer
    subscription = require('*/cartridge/scripts/utils/NewsletterUtils').GetSubscriptionSection(myCustomer.profile.custom.chId);

    // Subscribe
    let serviceResult = ContactHUBCustomer.sendSubscription(subscription);

    // Check Services Results
    return checkResult(serviceResult);

  } else if (! dw.system.Site.current.getCustomPreferenceValue("ContactLabSubscriptionOnlyRegistered")) {

    Logger.info("Subscribe guest user {0} to newsletter", email)
    // Subscribe Guest Customer to NL
    subscription = require('*/cartridge/scripts/utils/NewsletterUtils').GetSubscriptionSection();

    // Create Consents section
    let consentsSection = require('*/cartridge/scripts/utils/NewsletterUtils').GetConsentsSection(false, true);

    // Register Guest and Subscribe
    let serviceResult = ContactHUBCustomer.sendGuestCustomer(email, firstName, lastName, consentsSection, [ subscription ]);

    // Check Services Results
    return checkResult(serviceResult);

  } else {
    Logger.warn("Skip subscribe for mail {0}. User is Guest", email)
    return false;
  }
  Logger.info("Registering Newsletter. [done]");
};