// a module to store an array of connected users and manage them
var sky = require('./includes/sky.js');
var express = require('express')
var app = express.createServer();

// output nice HTML (not just squashed up on one line)
app.set('view options', { pretty: true });

// output everything in the 'public' directory as static files
app.use(express.static(__dirname+'/public'));

// fetch the sky channel list at start up
//sky.getChannelList();


app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site',description: 'meta description goes here' });
});
app.get('/channels', function(req, res) {
  sky.getChannelList(function(channelList) {
    var page = { title: 'Channel List',
                 description: 'Full channel list',
                 channels: channelList.channels};
    res.render('channels.jade', page);
  })



});

app.listen(3000);