'use strict';

var server = require('server');
var account = module.superModule;
server.extend(account);

const Logger = dw.system.Logger.getLogger("plugin_contactlab_sfra3", "Account");

// Retrive customer Profile
function loadCustomer(email: String): dw.customer.Customer {
  Logger.debug("Loading Profile information for customer {0}", email);
  let result = dw.customer.CustomerMgr.getCustomerByLogin(email);
  if (empty(result) || empty(result.profile)) {
    Logger.error("Cannot find a suitable customer for {[0]}", email);
  }
  return result;
}
/*
 * Submit information after profile update
 */
server.append('SaveProfile', function (req, res, next) {
  const ContactHUBCustomer = require('plugin_contactlab/cartridge/scripts/CHCustomers');

  this.on('route:Complete', function (req, res) {
    // Retrive Information from request
    if (! empty(req.currentCustomer) && ! empty(req.currentCustomer.profile.email)) {
      let email = req.currentCustomer.profile.email;
      let myCustomer = loadCustomer(email);

      if (! empty(myCustomer)) {
        ContactHUBCustomer.syncProfile(myCustomer.profile);
      } else {
        // myCustomer empty
        Logger.error("Customer login {0} NOT Found. Cannot update on ContactHub", email);
      }
    } else {
      // Request do not contain customer information
      Logger.error("Update customer fail. Current Customer value: {0}", JSON.stringify(req.currentCustomer));
    }
  });

  next();
});

/*
 * Submit information after new registration
 */
server.append('SubmitRegistration', function (req, res, next) {
  const ContactHUBCustomer = require('plugin_contactlab/cartridge/scripts/CHCustomers');
  const NewsletterUtils = require('*/cartridge/scripts/utils/NewsletterUtils');

  this.on('route:Complete', function (req, res) {
    // Retrive Customer Data from request
    let viewData = res.getViewData();
    if (viewData.success) {

      // Retrive customer information
      let email = viewData.email;
      let myCustomer = loadCustomer(email);

      if (! empty(myCustomer)) {

        // Check (and create) subscription section)
        var registrationForm = server.forms.getForm('profile');
        let addToNewsletter = registrationForm.customer.addtoemaillist.value;
        Logger.info("User {0} Add to Newsletter {1}", email, addToNewsletter)

        let subscriptionSection = null;
        if (addToNewsletter) {
          subscriptionSection = NewsletterUtils.GetSubscriptionSection(myCustomer.profile.custom.chId);
        } else {
          Logger.info("Skip adding NL Section for customer {0}", email);
        }
        let subscriptionSections = empty(subscriptionSection) ? undefined : [subscriptionSection];

        // Create Consents Section
        let consentFlag = req.session.privacyCache.get('consent');
        let consentsSection = NewsletterUtils.GetConsentsSection(consentFlag, addToNewsletter);

        // Send data to ContactHub
        ContactHUBCustomer.sendCustomer(myCustomer, consentsSection, subscriptionSections);
        ContactHUBCustomer.openSession(myCustomer.profile.custom.chId);
      } else {
        // myCustomer empty
        Logger.error("Customer login {0} NOT Found. Cannot send to ContactHub", email);
      }
    } else {
      // ViewData do not contain success
      Logger.error("Submit Registration result login {0} NOT Found. Cannot send to ContactHub", 'xxx');
    }
  });

  next();
});
/*
 * Submit information after profile update
 */
server.append('Login', function (req, res, next) {
  const ContactHUBCustomer = require('plugin_contactlab/cartridge/scripts/CHCustomers');

  this.on('route:Complete', function (req, res) {
    // Retrive Customer Data from request
    let viewData = res.getViewData();
    if ((viewData.success) && (! empty(viewData.authenticatedCustomer) && ! empty(viewData.authenticatedCustomer.profile))) {
      let myCustomer = viewData.authenticatedCustomer;

      if (! empty(myCustomer.profile.custom.chId)) {
        ContactHUBCustomer.openSession(myCustomer.profile.custom.chId);
      } else {
        // myCustomer empty
        Logger.error("Customer {0} NOT have ContactLab ID. Cannot open Session.", myCustomer.profile.email);
      }
    } else {
      // Request do not contain customer information
      Logger.error("User not autenticated. Cannot open Session");
    }
    Logger.error("Login - Done");
  });

  next();
});

module.exports = server.exports();