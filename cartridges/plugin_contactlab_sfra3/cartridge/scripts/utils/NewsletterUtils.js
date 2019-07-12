'use strict';

function getCurrentDateISOStr() {
  return (new Date()).toISOString();
}

exports.GetSubscriptionSection = function(chId) {
  let PostSubscription = require('plugin_contactlab/cartridge/scripts/models/PostSubscription');
  let newSubscription = new PostSubscription();

  newSubscription.id = dw.system.Site.current.getCustomPreferenceValue("ContactLabSubscriptionID");
  newSubscription.name = dw.system.Site.current.getCustomPreferenceValue("ContactLabSubscriptionName");
  newSubscription.type = dw.system.Site.current.getCustomPreferenceValue("ContactLabSubscriptionType");
  newSubscription.subscribed = true;
  newSubscription.subscriberId = chId || undefined;
  let currentDateStr = getCurrentDateISOStr();
  newSubscription.startDate = currentDateStr;
  newSubscription.registeredAt = currentDateStr;
  newSubscription.updatedAt = currentDateStr;
  return newSubscription;
}

exports.GetConsentsSection = function(profilingFlag, marketingFlag) {
  let consentDate='2019-01-20T13:00:30.422Z'
  let consentVersion='1.0.0';

  return {
    "disclaimer": {
      "date": consentDate,
      "version":consentVersion
    },
    "profiling": {
      "online" : {
        "status": profilingFlag
      }
    },
    "marketing": {
      "automatic": {
        "email" : {
          "status": marketingFlag
        }
      }
    }
  };
}