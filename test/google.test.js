var testutil = require('testutil')
  , google = require('../lib/google')
  , crypto = require('crypto')

describe('+ google()', function(){
  it('should return search results', function(done){
    var nextCounter = 0;
    var allLinks = [];
    var query = "Microsoft";

    var finished = function(){
      T (allLinks.length > 20);
      var flags = 0x0;
      for (var i = 0; i < allLinks.length; ++i) {
        var link = allLinks[i];
        //console.dir(link)
        if (link.title && link.link) {
          if (link.title.indexOf('Wikipedia')) {
            flags |= 0x1;
          }
          if (link.link.indexOf('microsoft.com')){
            flags |= 0x2;
          }
          if (link.link.indexOf('twitter.com/Microsoft')){
            flags |= 0x4;
          }
          if (link.title.indexOf('Microsoft Corporation')){
            flags |= 0x8;
          }
          if (link.title.indexOf('Microsoft Store')){
            flags |= 0x10;
          }
        }
      
        T (link.description.indexOf('Cached') == -1)
      }

      //console.log(flags)
      T (flags === 31); //all flags above set properly

      done();
    }


    google(query, function(err, next, links){
      //console.log('L: ' + links.length);
      allLinks = allLinks.concat(links);
      if (nextCounter < 2) {
        if (next) {
          nextCounter += 1;
          next();
        } else {
          finished();
        }
      } else {
        finished();
      }
    });
  
  })
  
  it('should not return search results when there are none', function(done){
    var query = crypto.randomBytes(150).toString('hex');

    google(query, function(err, next, links){
      T (links.length == 0);
      done();
    });
  
  })

  describe('when resultsPerPage is set', function () {
    it('should return search results', function(done){
      var nextCounter = 0
        , allLinks = []
        , query = "Microsoft";

      var finished = function(){
        T (allLinks.length > 90);
        done()
      }

      google.resultsPerPage = 100;
      google(query, function(err, next, links){
        allLinks = allLinks.concat(links);
        //console.log(allLinks.length)
        finished();
      })
    
    })
  })

  describe('when proxy is set', function () {
    it('should return search results', function(done){
      var nextCounter = 0
        , allLinks = []
        , query = "Microsoft";

      var finished = function(){
        T (allLinks.length > 90);
        done()
      }

      // tested with real proxy
      // TODO: setup local proxy to test
      var opt = {
        query: query,
        proxy: ''
      };
      google(opt, function(err, next, links){
        allLinks = allLinks.concat(links);
        //console.log(allLinks.length)
        finished();
      })
    
    })
  })
}) 
