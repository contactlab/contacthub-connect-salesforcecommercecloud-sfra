importPackage(dw.system);
importPackage(dw.svc);


let utils = require('~/cartridge/scripts/utils/utils');
const Logger = dw.system.Logger.getLogger("plugin_contactlab", "hub");

let CHRequest = require('~/cartridge/scripts/utils/CHRequest');

const SERVICE_PREFIX = "plugin_contactlab";

function configureService(serviceName : String) {
  var newReq = new CHRequest();
  return newReq.configureService(serviceName);
}

function configureAndCallService(serviceName : String, obj : Object) : Result {
  let result : Result;
  try {
    result = configureService(serviceName).call(obj);
  } catch (e) {
    Logger.error('Service ' + serviceName + ' failed: ' + e.message);
  }

  return result;
}

function getCustomers() : Result {
  let serviceName: String = SERVICE_PREFIX+".http.customers.get";
  return configureAndCallService(serviceName);
}

function postCustomer(postCustomer) : Result {
  let serviceName : String = SERVICE_PREFIX+".http.customers.post";
  let customerResult : Result = configureAndCallService(serviceName, postCustomer);

  Logger.info("Posting [{0}] Results [{1}]", JSON.stringify(postCustomer), customerResult != null ?customerResult.getObject():"NULL Result");

  if (customerResult != null && customerResult.getObject() != null) {
    let resultObject = JSON.parse(customerResult.getObject());

    // Post Session - MFAB: Check Values
    /*
    let sessionID = utils.getDwSession();
    if (! empty(sessionID)) {
      serviceName = SERVICE_PREFIX+".http.customerssessions.post";
      configureService(serviceName).setUrlParameters({id: resultObject.id})
        .call({value: sessionID});
    } else {
      Logger.error("SessionID is NULL. Unable to post session")
    }
    */
  }
  return customerResult;
}

function patchCustomer(chId, postCustomer) : Result {
  let serviceName : String = SERVICE_PREFIX+".http.customers.patch";
  let service = configureService(serviceName);
  service.setUrl(service.getUrl() + '/' + chId);
  return service.call(postCustomer);
}

function postSession(chId: String, sessionId: String) {
  let mySessionID = sessionId
  if (empty(mySessionID)) {
    mySessionID = utils.getDwSession();
  }

  if (!empty(chId)) {
    serviceName = SERVICE_PREFIX + ".http.customerssessions.post";
    let result : Result = configureService(serviceName).setUrlParameters({ id: chId })
      .call({ value: mySessionID });
    return result;
  } else {
    Logger.error("SessionID is NULL. Unable to post session")
  }
}
// function postSession(postSession : Object) : Result {
//   Logger.info("Post Session. {0}", JSON.stringify(postSession))
//   let serviceName: String = SERVICE_PREFIX + ".http.customerssessions.post";
//   serviceResult = configureService(serviceName).setUrlParameters({ id: postSession.id })
//     .call(postSession);
//   Logger.debug("Posting Session [{0}] Results [{1}]", JSON.stringify(postSession), serviceResult != null ? serviceResult.getObject() : "NULL Result");
//   return serviceResult;
// }

function postSubscription(customerId : String, postSubscription) : Result {
	let serviceName : String = SERVICE_PREFIX+'.http.customerssubscriptions.post';
	let result : Result = configureService(serviceName).setUrlParameters({id: customerId})
      .call(postSubscription);
    return result;
}

function postEvent(postEvent) : Result {
  let serviceName : String = SERVICE_PREFIX+".http.events.post";
  return configureAndCallService(serviceName, postEvent);
}


exports.getCustomers = getCustomers;

exports.postCustomer = postCustomer;

exports.postSession = postSession;

exports.patchCustomer = patchCustomer;

exports.postEvent = postEvent;

exports.postSubscription = postSubscription;
