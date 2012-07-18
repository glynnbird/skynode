// the sky library
var sky = require('./includes/sky.js');

// the trusty express framework
var express = require('express')
var app = express.createServer();

// output nice HTML (not just squashed up on one line)
app.set('view options', { pretty: true });

// output everything in the 'public' directory as static files
app.use(express.static(__dirname+'/public'));

// home pages
app.get('/', function(req, res){
  
  // preparte the page data
  var page = { title: 'Sky Node',
               description: 'Sky Node - A Sky EPG built in Node.js',
               dateList: sky.getValidDateList() }
               
  // render the index page
  res.render('index.jade', page);
});

// get full list of channels
app.get('/channels', function(req, res) {
  
  // fetch a list of channels using the Sky API
  sky.getChannelList(function(channelList) {
    
    // prepare the page data
    var page = { title: 'Channel List',
                 description: 'Full channel list',
                 channels: channelList.channels,
                 dateList: sky.getValidDateList()};
    
    // render the channel list page
    res.render('channels.jade', page);
  })
});

// get a single channel
app.get('/channel/:channelno', function(req, res) {
  
  // fetch the data for a single channel using the Sky API
  sky.getProgrammeList(req.params.channelno, sky.getDateString(new Date(),true), function(programmes) {
    
    // prepare the page data
    var page = { title: 'Channel List - ' + programmes.channels.title,
                 description: 'Full channel list for '+programmes.channels.title,
                 programmes:  programmes.channels.program,
                 dateList: sky.getValidDateList()};
                 
    // render a single channel's programmes
    res.render('channel.jade', page);
  })
});

// get channel guide
app.get('/guide/:year/:month/:day', function(req, res) {
  
  // construct a date from the supplied parameters
  var d = new Date(req.params.year, req.params.month - 1, req.params.day,0,0,0);
  
  // convert date to Sky's format
  var skyDate = sky.getDateString(d);
  console.log(skyDate);
  
  //  fetch the data for a list of channels
  var channelList = "2076,2006,1624,1829,1627"; // 2061,2061,6505,
  sky.getProgrammeList(channelList, skyDate, function(data) {

     // prepare the page data
     var page = { title: 'Guide',
                  description: 'Programme guide',
                  channels:  data.channels,
                  dateList: sky.getValidDateList()};
                  
     // render the channels' data as an programme guide
     res.render('guide.jade', page);
   })
});

// listen on port 3000
app.listen(3000);