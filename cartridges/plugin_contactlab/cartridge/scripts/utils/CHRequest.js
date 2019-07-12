importClass(dw.net.HTTPClient);
importPackage(dw.system);
importPackage(dw.svc);


let chConfigs = require('~/cartridge/scripts/utils/CHConfigs');
let services = require('~/cartridge/scripts/contactHubServices');

    var CHRequest = function() {
        let self = this;
        let service : HTTPService;
        let requestData : Object;

        self.configureService = function(name: String, resource: String, method: String) {
            service = services[name];
            if (!resource) {
            	resource = name.split('.').slice(-2)[0];
            }
            if (!method) {
            	method = name.split('.').slice(-1)[0];
            }
            service.setRequestMethod(method.toUpperCase());
            service.setURL(chConfigs.getUrlByMethod(resource));
            return self;
        };

        self.getUrl = function() : String {
        	return service.getURL();
        };

        self.setUrl = function(url : String) {
        	service.setURL(url);
        	return self;
        };

        self.setUrlParameters = function(params : Object) {
        	let url : String = service.getURL();
        	for (let param in params) {
        		if (params.hasOwnProperty(param)) {
        			url = url.replace('{' + param + '}', params[param]);
        		}
        	}
        	service.setURL(url);
        	return self;
        };

        self.setParams = function(object : Object) {
        	if (service.getRequestMethod() === 'GET') {
	            for (let key in object) {
	            	service.addParam(key, object[key]);
	            }
        	}
            return self;
        };

        self.call = function(args) : Result {
        	return service.call(args);
        }
    };

    module.exports = CHRequest;
