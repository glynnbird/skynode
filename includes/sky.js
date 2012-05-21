var CHANNEL_LIST_URL = "http://epgservices.sky.com/tvlistings-proxy/TVListingsProxy/init.json";
var PROGRAMME_LIST_URL = "http://epgservices.sky.com/tvlistings-proxy/TVListingsProxy/tvlistings.json";
var http = require('http');
var Shred = require("shred");
var shred = new Shred();
var cache = require('memory-cache');
var CHANNEL_LIST_CACHE_KEY='channelList';


var getChannelList = function(callback) {
  
  var channelList = cache.get(CHANNEL_LIST_CACHE_KEY);
  if(channelList && callback !=undefined) {
    console.log("return from cache");
    callback(channelList)  
  } else {
    console.log("fetch from source");
    var req = shred.get({
      url: CHANNEL_LIST_URL,
      headers: {
        "Accept-Encoding": "gzip"
      },
      on: {
        // You can use response codes as events
        200: function(response) {
          channelList = eval('(' + response.content.body + ')');
          cache.put(CHANNEL_LIST_CACHE_KEY,channelList,1000*60*60*12)
          console.log('done');
          if(callback != undefined) {
            callback(channelList)          
          }
        },
        // Any other response means something's wrong
        response: function(response) {
          if(callback != undefined) {
            callback(false);
          }
        }
      }
    });
    
  }
}

var getProgrammeList = function(channelFilter,listingDate,callback) {
  var url = PROGRAMME_LIST_URL;
  var detail=2;
  var duration=24*60;
  var listingDate='201205210000'
  url=url+"?channels="+escape(channelFilter)+"&dur="+escape(duration)+"&time="+escape(listingDate)+"&detail="+escape(detail);
  console.log(url);
  
  
  // check for a version stored in cache
  var programmeData = cache.get(url);
  if(programmeData && callback !=undefined) {
    console.log("return from cache");
    callback(programmeData)  
  } else {
    console.log("fetch from source");
  
    var req = shred.get({
      url: url,
      headers: {
        "Accept-Encoding": "gzip"
      },
        on: {
          // You can use response codes as events
          200: function(response) {
            programmeData = eval('(' + response.content.body + ')');
            cache.put(url,programmeData,1000*60*60*12);
            if(callback != undefined) {
              callback(programmeData)          
            }
          },
          // Any other response means something's wrong
          response: function(response) {
            if(callback != undefined) {
              callback(false)          
            }
          }
        }
      });
   }
}

module.exports = {
  getChannelList: getChannelList,
  getProgrammeList: getProgrammeList
}