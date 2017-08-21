/** Script ACLs do not delete 
 read=nobody 
write=nobody
execute=authenticated 
  **/ 
 
 var httpclient = require("./httpclient.js");
var tokenmanager = require("./oauth2/tokenmanager.js");
var trafficmanager = require("./trafficmanager.js");
var parkingmanager = require("./parkingmanager.js");
var pedestrianmanager = require("./pedestrianmanager.js");


/**
 * Single entry point to predix APIs
 * @class Predix
 * @contructor
 * @param {Object} [dto]
 * @param {Object} [dto.credentials] credentials to use (clientId, password, accountId)
 */
function Predix(dto) {
  var params = null;

  if (dto && dto.credentials) {
    params  = dto.credentials;
  }

  this.tokenManager = new tokenmanager(params);
  this.client = new httpclient({tokenMgr:this.tokenManager});
}

Predix.prototype.initializeToken = function () {
  return new Promise((resolve, reject) => {
    this.client.initializeToken().then(() => {
      resolve();
    })
  })
}

/**
 * @method getTrafficManager
 * @return {Object} instance of TrafficManager
 */
Predix.prototype.getTrafficManager = function(){
  return new trafficmanager.TrafficManager({client:this.client});
}


/**
 * @method getParkingManager
 * @return {Object} instance of Parkingmanager
 */
Predix.prototype.getParkingManager = function(){
  return new parkingmanager({client:this.client});
};

/**
 * @method getParkingManager
 * @return {Object} instance of PedestrianManager
 */
Predix.prototype.getPedestrianManager = function(){
  return new pedestrianmanager.PedestrianManager({client:this.client});
};
module.exports = Predix;