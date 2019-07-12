importPackage(dw.svc);
importPackage(dw.net);
importPackage(dw.io);


let chConfigs = require('~/cartridge/scripts/utils/CHConfigs');

const SERVICE_PREFIX = "plugin_contactlab";

function configureService(name: String, createcb) {
    return LocalServiceRegistry.createService(name, {
        createRequest: function(service: HTTPService, args : Object) : String {
            service.addHeader('Authorization', 'Bearer ' + chConfigs.getToken());
            if (service.getRequestMethod() === 'GET') {
            	service.addParam('nodeId', chConfigs.getNodeId());
            } else if (['POST', 'PUT', 'PATCH'].indexOf(service.getRequestMethod()) > -1) {
            	service.addHeader('Content-Type', 'application/json');
            }
            let body = JSON.stringify(args);
            let result = createcb ? createcb(service, args) : body;
            return result;
        },
        parseResponse: function(service: HTTPService, client: HTTPClient) : String {
            return client.text;
        },
        mockCall: function(service: HTTPService, client: HTTPClient) : Object {
            return {
                statusCode: 200,
                statusMessage: "Success",
                text: "MOCK RESPONSE (" + service.getURL() + ")"
            };
        }
    });
}

['customers.get','customers.post','customers.patch','customerssessions.post','customerssubscriptions.post','events.post'].forEach(function(name) {
    let fullName = SERVICE_PREFIX + '.http.' + name;
    module.exports[fullName] = configureService(fullName,
        function(service: HTTPService, args : Object) {
            return JSON.stringify(args);
        }
    );
});
