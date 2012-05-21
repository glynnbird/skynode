var CHANNEL_LIST_URL = "http://epgservices.sky.com/tvlistings-proxy/TVListingsProxy/init.json";
var http = require('http');
var Shred = require("shred");
var shred = new Shred();

var getChannelList = function(callback) {
  
  
  var req = shred.get({
    url: CHANNEL_LIST_URL,
    headers: {
      "Accept-Encoding": "gzip"
    },
    on: {
      // You can use response codes as events
      200: function(response) {
        callback(response.content.data)
      },
      // Any other response means something's wrong
      response: function(response) {
        callback(false);
      }
    }
  });
}

var getProgrammeList = function(channelFilter,listingDate,callback) {
  var url = PROGRAMME_LIST_URL;
  var detail=2;
  var duration=24*60;
  
  var req = shred.get({
    url: url,
    headers: {
      "Accept-Encoding": "gzip"
    },
      on: {
        // You can use response codes as events
        200: function(response) {
          callback(response.content.data)
        },
        // Any other response means something's wrong
        response: function(response) {
          callback(false);
        }
      }
    });
}

module.exports = {
  getChannelList: getChannelList
}