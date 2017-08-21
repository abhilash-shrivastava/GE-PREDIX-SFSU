/**
 * Created by Abhi on 8/20/17.
 */
/** Script ACLs do not delete
 read=nobody
 write=nobody
 execute=anonymous
 **/
var factory = require("./predix/scripts/factory");

// get a token for clientId == parking2
var predix = new factory({credentials:{clientId:"hackathon", clientPassword:"@hackathon"},
  username: 'hackathon',
  userPassword: '@hackathon'
});
predix.initializeToken().then(() => {
  // get an instance of ParkingManager
  var pedestrianManager = predix.getPedestrianManager();

  // Specify location of the parking slot
  var boundary1 = "32.123:-117";
  var boundary2 = "32.714983:-117.158012";

  // To simplify, just get the first 20 parking spots at this location (if any)
  var options = {
    "page": 0,
    "size": 20
  };

  pedestrianManager.listCrosswalks(boundary1, boundary2, options).then((result) => {
    var report = [];
    var promises = [];
    for (var i = 0; i < result.locations.length; i++) {
      var crosswalk = result.locations[i];
      promises.push(getPedestrianPerSecond(crosswalk, boundary1, boundary2, options))
    }
    Promise.all(promises).then((responses) => {
      responses.forEach((response) => {
        report.push(response);
      });
      return report;
    })
  });
});

function getPedestrianPerSecond(crosswalk, boundary1, boundary2, options) {
  return new Promise((resolve, reject) => {
    crosswalk.listCrosswalkAssets(boundary1, boundary2, options).then((assetList) => {
      var asset = assetList[0];

      // Get last page of Vehicles In and Vehicle Out event since the last 24h for the given asset
      var endDate = new Date();
      var endTime = endDate.getTime();
      var startTime = endTime - (24 * 3600000);

      var options = {
        "size": 1,
        "page": 2000000
      }

      var pIn;
      var pOut;

      asset.listPedestrianIn(startTime, endTime, options).then((response)=> {
        pIn = response;
        asset.listPedestrianOut(startTime, endTime, options).then((response) => {
          pOut = response;
          var pedestriansWithin = pIn-pOut;
          resolve({
            spot: crosswalk["location-uid"],
            location: crosswalk.coordinate,
            totalPedestrianIn: pIn,
            totalPedestrianOut: pOut,
            pedestriansWithin: pedestriansWithin,
            pedestriansPerSecond: pIn/1000
          });
        })
      });
    });
  });
}
/**
 * Created by Trent on 6/27/2017.
 */
