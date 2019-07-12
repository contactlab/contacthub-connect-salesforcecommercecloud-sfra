'use strict';

// TODO: Move getDwSession in utils.js
// TODO: Remove export for logger


let logger: dw.system.Log = dw.system.Logger.getLogger('plugin_contactlab', '');

exports.getLogger = function() : Log {
	return logger;
};



// ---
exports.getDwSession = function(req : dw.system.Request) : String {
  // TODO: Remove global variable
  return session.sessionID;
}
// ---