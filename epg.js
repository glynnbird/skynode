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
  var page = { title: 'Sky Node',
               description: 'Sky Node - A Sky EPG built in Node.js',
               dateList: sky.getValidDateList() }
  res.render('index.jade', page);
});

// get full list of channels
app.get('/channels', function(req, res) {
  sky.getChannelList(function(channelList) {
    var page = { title: 'Channel List',
                 description: 'Full channel list',
                 channels: channelList.channels,
                 dateList: sky.getValidDateList()};
    res.render('channels.jade', page);
  })
});

// get a single channel
app.get('/channel/:channelno', function(req, res) {
  sky.getProgrammeList(req.params.channelno, sky.getDateString(new Date(),true), function(programmes) {
    var page = { title: 'Channel List - ' + programmes.channels.title,
                 description: 'Full channel list for '+programmes.channels.title,
                 programmes:  programmes.channels.program,
                 dateList: sky.getValidDateList()};
    res.render('channel.jade', page);
  })
});

// get channel guide
app.get('/guide/:date', function(req, res) {
  var channelList = "2076,2006,2061,2061,6505,1624,1829,1627";
  sky.getProgrammeList(channelList, req.params.date, function(data) {
    console.log(data);
     var page = { title: 'Guide',
                  description: 'Programme guide',
                  channels:  data.channels,
                  dateList: sky.getValidDateList()};
     res.render('guide.jade', page);
   })
});

app.listen(3000);