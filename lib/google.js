var request = require('request')
  , cheerio = require('cheerio')
  , fs = require('fs')
  , querystring = require('querystring')
  , util = require('util');


var linkSel = 'h3.r a'
  , descSel = 'div.s'
  , itemSel = 'li.g'
  , nextSel = 'td.b a span'
  , noneFoundSel = ".med:contains(No results)";

var URL = 'http://www.google.com/search?hl=en&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8';

function google(query, callback) {
  igoogle(query, 0, callback);
}

google.resultsPerPage = 10;

var igoogle = function(query, start, callback) {
  var opt;
  if (typeof query === 'object') {
    opt = {
      query: querystring.escape(query.query),
      proxy: query.proxy
    };
  } else {
    opt = {
      query: querystring.escape(query)
    };
  }

  //console.log("google:options")
  //console.log(opt);

  if (google.resultsPerPage > 100) google.resultsPerPage = 100; //Google won't allow greater than 100 anyway

  var newUrl = util.format(URL, opt.query, start, google.resultsPerPage);
  var rOpt = {
    url: newUrl,
    proxy: opt.proxy
  };

  request(rOpt, function(err, resp, body) {
    if ((err === null) && resp.statusCode === 200) {
      if (body.indexOf("No results found for ") !== -1){
        return callback(null, null, []);
      }
      var $ = cheerio.load(body)
        , links = []
        , text = [];
      
      $(itemSel).each(function(i, elem) {
        var linkElem = $(elem).find(linkSel)
          , descElem = $(elem).find(descSel)
          , item = {title: $(linkElem).text(), link: null, description: null, href: null}
          , qsObj = querystring.parse($(linkElem).attr('href'));
        
        
        if (qsObj['/url?q']) {
          item.link = qsObj['/url?q'];
          item.href = item.link;
        }
        else if (!!(Object.keys(qsObj))[0]) {
          item.href = (Object.keys(qsObj))[0];
        }
        
        $(descElem).find('div').remove();
        item.description = $(descElem).text();
        if (!!item.href){
          if (item.href.substring(0,4) === "http"){
            links.push(item);
          }
        }
      });

      var nextFunc = null;
      if ($(nextSel).last().text() === 'Next'){
        nextFunc = function() {
          igoogle(opt.query, start + google.resultsPerPage, callback);
        };
      }
      
      callback(null, nextFunc, links);
    } else {
      e = new Error();
      if (!!resp) { e.status = resp.statusCode; }
      else if (!!err) { e = err; }
      callback(e, null, null);
      //callback(new Error('Error on response (' + resp.statusCode + '):' + err +" : " + body), null, null);
    }
  });
};

module.exports = google;


