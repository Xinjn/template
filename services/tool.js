const portscanner = require("portscanner");
const util = require("util");
const os = require("os");
const findAPortNotInUse = util.promisify(portscanner.findAPortNotInUse);

exports.getIp = () => {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
};

exports.getPort = async () => {
  let port = await findAPortNotInUse(3000, 4000, "127.0.0.1");
  return port
};

