function setup() {

    var socket = io.connect('http://localhost:3000');

    var searchBar = select('#twitterSearch');

    var twitterUser = '';
    var htmlTweets = [];
    var htmlManifestoParagraph;

    var nouns = [];
    var verbs = [];
    var adverbs = [];
    var adjectives = [];

    var lexicon = new RiLexicon();
    var rGrammar = new RiGrammar();
    rGrammar.addRule('<start>', 'The <AJ> <N> <V> <AV>. ');

    var tweetHeader = select('#tweetsHeader');

    //var button = select('#manifestoButton');


    var searchForTwitterUser = function() {
      console.log('you are typing: ', searchBar.value());
      twitterUser = searchBar.value();
      tweetHeader.html(`Tweets from: @${twitterUser}`);

      var data = {
          searchTerm: searchBar.value()
      };
      socket.emit('SearchTerm', data);
    };

    //button.mousePressed(searchForTwitterUser);
    searchBar.changed(searchForTwitterUser);



    socket.on('noUser', function(errorMessage) {
        console.log(errorMessage);
        tweetHeader.html(errorMessage.message);

        if (htmlTweets.length > 0)
            htmlTweets.forEach(function(htmlTweet) {
                htmlTweet.remove();
            });
        }
    );

    socket.on('tweets', function(serverTweets) {
        //console.log(serverTweets);
        var tweets = serverTweets.tweets;

        if (htmlTweets.length > 0) {
            console.log('Remove old tweets');
            htmlTweets.forEach(function(htmlTweet) {
                htmlTweet.remove();
            });

            // Need to do this as well for some reason to clear old tweets
            htmlTweets = [];

            htmlManifestoParagraph.remove();

            nouns = [];
            verbs = [];
            adverbs = [];
            adjectives = [];

            rGrammar.removeRule('<N>');
            rGrammar.removeRule('<V>');
            rGrammar.removeRule('<AJ>');
            rGrammar.removeRule('<AV>');
        }

        tweets.forEach(function(tweet, index) {
            htmlTweets.push(createElement('li', tweet));
        });

        htmlTweets.forEach(function(htmlTweet) {
            htmlTweet.parent('#tweets');
        });

        var rsTweets = [];
        tweets.forEach(function(tweet) {
            rsTweets.push(new RiString(tweet));
        });

        rsTweets.forEach(function(rsTweet) {
            // console.log(rsTweet);
            rsTweet.words().forEach(function(word) {
                if (lexicon.isNoun(word)) {
                    nouns.push(word.toLowerCase());
                }
                if (lexicon.isVerb(word)) {
                    verbs.push(word.toLowerCase());
                }

                if (lexicon.isAdjective(word)) {
                    adjectives.push(word.toLowerCase());
                }

                if (lexicon.isAdverb(word)) {
                    adverbs.push(word.toLowerCase());
                }

            });
        });

        // console.log('List of nouns:', nouns);
        // console.log('List of verbs:', verbs);
        // console.log('List of adjectives:', adjectives);
        // console.log('List of adverbs:', adverbs);

        nouns.forEach(function(noun) {
            rGrammar.addRule('<N>', noun)
        });

        verbs.forEach(function(verb) {
            rGrammar.addRule('<V>', verb)
        });

        adjectives.forEach(function(adjective) {
            rGrammar.addRule('<AJ>', adjective)
        });

        adverbs.forEach(function(adverb) {
            rGrammar.addRule('<AV>', adverb)
        });





        if (rGrammar.hasRule('<N>')) {
          var manifestoParagraph = '';

          for (var i = 0; i < 10; i++) {
              manifestoParagraph += rGrammar.expand();
          }

          htmlManifestoParagraph = createP(manifestoParagraph);
          htmlManifestoParagraph.parent('#manifesto');
        }

    });

}
