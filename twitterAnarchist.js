console.log('The Twitter Anarchist is starting on port 3000');

var Twit = require('twit');

var config = require('./config');
var T = new Twit(config);

var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

var tweets = [];

io.sockets.on('connection', function(socket) {

  socket.on('SearchTerm', function(searchResults) {

    console.log(searchResults);

    T.get('statuses/user_timeline', { screen_name: searchResults.searchTerm, count: 20, include_rts: false }, function(err, data, response) {

      if(err) {
        socket.emit('noUser', {message: 'No users found with this twitter handle'});
        console.log(err);
      }
      else {

        if(tweets.length > 0) tweets = [];

        data.forEach(function(data){
          tweets.push(data.text)
        });
        console.log(tweets);

        socket.emit('tweets', {tweets: tweets});
      }

    })
  })

});
