'use strict';

let logger: dw.system.Log = dw.system.Logger.getLogger('plugin_contactlab', 'CHConfigs');
let sitePrefs: dw.system.SitePreferences = dw.system.Site.getCurrent().getPreferences();
let orgPrefs : dw.system.OrganizationPreferences = dw.system.System.getPreferences();

function getPreference(name: String) : String {
	if (name in sitePrefs.getCustom()) {
		return sitePrefs.getCustom()[name];
	}
	if (name in orgPrefs.getCustom()) {
		return orgPrefs.getCustom()[name];
	}
	return '';
}

let token: String = getPreference('ContactLabHubToken');
let tokenJs = getPreference('ContactLabHubTokenJs');
let baseUrl: String = getPreference('ContactLabHubURL');
let workspace: String = getPreference('ContactLabHubWorkspace');
let nodeId: String = getPreference('ContactLabHubNode');
let baseCartridge : String = getPreference('BaseCartridge');


exports.getWorkspace = function() : String {
	return workspace;
};

exports.getToken = function() : String {
    return tokenJs;
};

exports.getTokenJs = function() : String {
    return tokenJs;
};

exports.getBaseUrl = function() : String {
    return baseUrl;
};

exports.getNodeId = function() : String {
	return nodeId;
};

exports.getUrl = function() : String {
    return this.getBaseUrl() + this.getWorkspace();
};

exports.getBaseCartridge = function() : String {
	return baseCartridge;
};

exports.getUrlByMethod = function(method : String) : String {
  let path = dw.web.Resource.msg('api.method.' + method, 'cl_hub', null);
  if (!path) {
      throw new Error('Unknown API method \"' + method + '\"');
  }
  let finalURL = this.getUrl() + path;
  return finalURL;
};