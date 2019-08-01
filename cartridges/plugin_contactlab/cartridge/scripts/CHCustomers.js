'use strict';

let Transaction : dw.system.Transaction = require('dw/system/Transaction');
let CHServicesHelper = require('~/cartridge/scripts/CHServicesHelper');
let PostCustomer = require('~/cartridge/scripts/models/PostCustomer');
let BaseProperty = require('~/cartridge/scripts/models/BaseProperty');
let chConfigs = require('~/cartridge/scripts/utils/CHConfigs');

const Logger = dw.system.Logger.getLogger("plugin_contactlab", "customers");

function sendCustomerByLogin(login : String): dw.svc.Result {
  // Remove references of Sitegenesis CustomerModel
  let customer : dw.customer.Customer = dw.customer.CustomerMgr.getCustomerByLogin(login);
  return customer ? sendCustomer(customer) : false;
}

function sendGuestCustomer(email: String, firstName: String, lastName: String, consentsSection, subscriptionSections) : dw.svc.Result {
  // Build Guest Post Customer
  let baseProperty = new BaseProperty(email, firstName, lastName);
  let postCustomer = new PostCustomer(baseProperty);
  postCustomer.nodeId = chConfigs.getNodeId();
  // Append Addictional Sections if defined
  if (!empty(consentsSection)) {
    postCustomer.consents = consentsSection;
  }
  if (!empty(subscriptionSections)) {
    postCustomer.base.subscriptions = subscriptionSections;
  }
  // Finally
  return sendPostCustomer(postCustomer, customer);
}

function sendCustomer(customer : dw.customer.Customer, consentsSection, subscriptionSections) : dw.svc.Result {
	if (!customer) {
    Logger.error("Cannot send a NULL customer");
    return null;
  }

  // Build Base Customer with additional properties
  let postCustomer = buildPostCustomerFromProfile(customer.profile, consentsSection, subscriptionSections);

  // Sent to Hub
  // let result : dw.svc.Result = Hub.postCustomer(postCustomer);

  return sendPostCustomer(postCustomer, customer);
}

function sendPostCustomer(postCustomer: Object, customer: dw.customer.Customer) {
  // Sent to Hub
  let result: dw.svc.Result = CHServicesHelper.postCustomer(postCustomer);

  // Check Results
  Logger.info(
    'Send customer to ContactHub returned status {0}, object {1}, error {2}',
    result.getStatus(),
    JSON.stringify(result.getObject()),
    JSON.stringify(result.getErrorMessage()));

  if (result.isOk()) {
    // Result is OK. Update customer
    let chId = JSON.parse(result.getObject()).id;
    updateFieldsForCustomer(customer, { chId: chId });
  } else if (result.getError() == 409) {
    // Error!
    let chId = JSON.parse(result.getErrorMessage()).data.customer.id;
    let patchCustomer = buildPatchCustomerFromPost(postCustomer);
    result = CHServicesHelper.patchCustomer(chId, patchCustomer);
    updateFieldsForCustomer(customer, { chId: chId });
  } else {
    Logger.error("Contact Hub returning an error {0}", result.getError());
  }
  return result;
}
function openSession(chId: String, sessionId: String) {
  let result: dw.svc.Result = CHServicesHelper.postSession(chId, sessionId);
  // Check Results
  Logger.info(
    'Send Session to ContactHub returned status {0}, object {1}, error {2}',
    result.getStatus(),
    JSON.stringify(result.getObject()),
    JSON.stringify(result.getErrorMessage()));
  return result;
}

function buildPostCustomerFromProfile(profile : dw.customer.Profile, consentsSection, subscriptionSections) {
  let baseProperty = buildBaseProperty(profile);
  let postCustomer = new PostCustomer(baseProperty);
  postCustomer.nodeId = chConfigs.getNodeId();
  // Append Addictional Sections if defined
  if (!empty(consentsSection)) {
    postCustomer.consents = consentsSection;
  }
  if (!empty(subscriptionSections)) {
    postCustomer.base.subscriptions = subscriptionSections;
  }
	return postCustomer;
}

function buildBaseProperty(profile: dw.customer.Profile) {
  let baseProperty = new BaseProperty(profile.getEmail(), profile.getFirstName(), profile.getLastName());
  baseProperty.fillFromProfile(profile);
  return baseProperty;
}

function buildPatchCustomerFromPost(postCustomer) {
	delete postCustomer.nodeId;
	return postCustomer;
}

function updateFieldsForCustomer(customer : dw.customer.Customer, customAttributes : Object) : void {
	if (customer != null) {
		updateFieldsForProfile(customer.getProfile(), customAttributes);
	}
}

function updateFieldsForProfile(profile: dw.customer.Profile, customAttributes: Object): void {
  if (profile != null) {
    customAttributes = customAttributes || {};
    Transaction.wrap(function () {
      for (let i in customAttributes) {
        if (customAttributes.hasOwnProperty(i)) {
          Logger.debug("Update custom attribute {0} -> {1}", profile.custom[i], customAttributes[i])
          profile.custom[i] = customAttributes[i];
        }
      }
      profile.custom.chLastSyncDate = new Date();
    });
  } else {
    Logger.error("Cannot update custom attribute chId: profile is NULL")
  }
}

function relateSessionId(chId: String, dwId: String): dw.svc.Result {
  let result: dw.svc.Result = CHServicesHelper.postSubscription({
    id: chId,
    value: dwId
  });
  Logger.debug('Relate session: {0}', JSON.stringify(result.getObject()));
  return result;
}

function sendSubscription(subscription: Object) : dw.svc.Result {
  dw.system.Logger.getLogger("MFAB", "sendSubscription").error("Sending new Subscription [start]")

  // Incoming object is a PostSubscription
  let postSubscription = subscription;

  dw.system.Logger.getLogger("MFAB", "sendSubscription").error("Sending new Subscription [send]")
  let result : dw.svc.Result = CHServicesHelper.postSubscription(postSubscription.subscriberId, postSubscription);
  dw.system.Logger.getLogger("MFAB", "sendSubscription").error("Sending new Subscription [done]")
	return result;
}

function buildPostSubscription(subscription : dw.object.CustomObject) {
	let PostSubscription = require('~/cartridge/scripts/models/PostSubscription');
	let postSubscription = new PostSubscription();
	postSubscription.id = subscription.getUUID();
	postSubscription.name = subscription.getCustom().subscriptionName;
	postSubscription.type = subscription.getCustom().type;
	postSubscription.subscriberId = subscription.getCustom().customerId;
	postSubscription.registeredAt = subscription.getCreationDate();
	postSubscription.updatedAt = subscription.getLastModified();
	return postSubscription;
}

function syncAllCustomers() : void {
	let CustomerMgr : dw.customer.CustomerMgr = require('dw/customer/CustomerMgr');
	let lastDate : Date = new Date();
	CustomerMgr.processProfiles(syncProfile, "lastModified <= {0}", lastDate);
}

function syncProfile(profile : dw.customer.Profile, consentsSection, subscriptionSections) : void {
	let condition : Boolean = profile.custom.chLastSyncDate == null
	    || (profile.getLastModified().getTime() >= profile.custom.chLastSyncDate.getTime());
	if (condition) {
	    let postCustomer = buildPostCustomerFromProfile(profile);
	    let patchCustomer = buildPatchCustomerFromPost(postCustomer);
	    let result : dw.svc.Result = CHServicesHelper.patchCustomer(profile.custom.chId, patchCustomer);
	    updateFieldsForProfile(profile, {chId: profile.custom.chId});
	}
}


exports.relateSessionId = relateSessionId;

exports.sendCustomerByEmail = sendCustomerByLogin;

exports.sendGuestCustomer = sendGuestCustomer;

exports.sendCustomer = sendCustomer;

exports.sendSubscription = sendSubscription;

exports.syncAllCustomers = syncAllCustomers;

exports.syncProfile = syncProfile;

exports.openSession = openSession;
