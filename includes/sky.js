
// the Shred library (https://github.com/spire-io/shred) is used because Sky's JSON api is gzipped
var Shred = require("shred");
var shred = new Shred();

// a simple memory cache (https://github.com/ptarjan/node-cache) is used to prevent multiple fetches of the same url
var cache = require('memory-cache');

// CONSTANTS

// the key under which the full channel list is saved
var CHANNEL_LIST_CACHE_KEY='channelList';

// the url where the full channel list is found
var CHANNEL_LIST_URL = "http://epgservices.sky.com/tvlistings-proxy/TVListingsProxy/init.json";

// the url where the channel list is found
var PROGRAMME_LIST_URL = "http://epgservices.sky.com/tvlistings-proxy/TVListingsProxy/tvlistings.json";

// the lifetime of cache entries - 24 hours in milliseconds
var CACHE_LIFETIME = 1000*60*60*24;

// extend the Date class to export dates in Sky's format
Date.prototype.toSkyDate = function () {
  var year = ""+this.getFullYear();
  var month = "0" + (this.getMonth()+1);
  var day = "0" + this.getDate();
  var hour = "0" + this.getHours();
  var minute = "0" + this.getMinutes();
  return year+month.slice(-2)+day.slice(-2)+hour.slice(-2)+minute.slice(-2);
};

// extend the Date class to export dates in UK's format
Date.prototype.toUKDate = function () {
  var year = ""+this.getFullYear();
  var month = "0" + (this.getMonth()+1);
  var day = "0" + this.getDate();
  return year+"/"+month.slice(-2)+"/"+day.slice(-2);
};

// fetch the full channel list
var getChannelList = function(callback) {
  
  // if a cached copy is available
  var channelList = cache.get(CHANNEL_LIST_CACHE_KEY);
  if(channelList && callback !=undefined) {
    // return the channel list from cache
    callback(channelList)  
  } else {
    // fetch the channel list from source using shred
    var req = shred.get({
      url: CHANNEL_LIST_URL,
      headers: {
        "Accept-Encoding": "gzip"
      },
      on: {
        // on success
        200: function(response) {
          // n.b. shred returns json decoded objects if the content-type is application/json but
          // in sky's case, it isn't
          channelList = eval('(' + response.content.body + ')');
          cache.put(CHANNEL_LIST_CACHE_KEY,channelList,CACHE_LIFETIME)
          if(callback != undefined) {
            callback(channelList)          
          }
        },
        // on fail
        response: function(response) {
          if(callback != undefined) {
            callback(false);
          }
        }
      }
    });
    
  }
}

// fetch the schedule for a list of channels
var getProgrammeList = function(channelFilter,listingDate,callback) {
  
  // construct the url
  var url = PROGRAMME_LIST_URL;
  var detail=2;
  var duration=24*60; // 1 day
  url=url+"?channels="+escape(channelFilter)+"&dur="+escape(duration)+"&time="+escape(listingDate)+"&detail="+escape(detail);
  console.log(url);
  
  // check for a version stored in cache
  var programmeData = cache.get(url);
  if(programmeData && callback !=undefined) {
    // return cached version
    callback(programmeData)  
  } else {
    // fetch the version from source
    var req = shred.get({
      url: url,
      headers: {
        "Accept-Encoding": "gzip"
      },
        on: {
          // on success
          200: function(response) {
            
            // parse the returned json
            programmeData = eval('(' + response.content.body + ')');
            
            // store it in cache
            cache.put(url,programmeData,1000*60*60*12);
            if(callback != undefined) {
              callback(programmeData)          
            }
          },
          // on fail
          response: function(response) {
            if(callback != undefined) {
              callback(false)          
            }
          }
        }
      });
   }
}

// return a date object in the correct format for the Sky API
var getDateString=function(d,atMidnight) {
  if(atMidnight) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);    
  }
  return d.toSkyDate();
}

// return a list of dates that the API is good for 
var getValidDateList=function() {
  /*
  [ { ukDate: '2012/05/22', skyDate: '201205220000' },
    { ukDate: '2012/05/23', skyDate: '201205230000' },
    { ukDate: '2012/05/24', skyDate: '201205240000' },
    { ukDate: '2012/05/25', skyDate: '201205250000' },
    { ukDate: '2012/05/26', skyDate: '201205260000' },
    { ukDate: '2012/05/27', skyDate: '201205270000' },
    { ukDate: '2012/05/28', skyDate: '201205280000' } ]
  */
  var d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  var i=0;
  var dateList = new Array();
  do {
    var ob = new Object();
    ob.ukDate = d.toUKDate();
    ob.skyDate = d.toSkyDate();
    dateList[i] = ob;
    // move forward a day
    d = new Date(d.getTime() + 1000 * 60 * 60 * 24);
    i++;
  } while(i<7);
  return dateList;
}

module.exports = {
  getChannelList: getChannelList,
  getProgrammeList: getProgrammeList,
  getDateString: getDateString,
  getValidDateList: getValidDateList
}