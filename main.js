const axios = require('axios');
const parseString = require('xml2js').parseString;
const utf8 = require('utf8');
const headlineUrl = 'https://s3-ap-southeast-2.amazonaws.com/nzme-voice/zbnews/flash-briefing-zb.json';
const showlist = [
  'https://www.newstalkzb.co.nz/rss/podcasts-source/heather-du-plessis-allan-drive-source/',
  'https://www.newstalkzb.co.nz/rss/podcasts-source/mike-hosking-breakfast-source/',
  'https://www.newstalkzb.co.nz/rss/podcasts-source/newstalk-zbs-early-edition-source/'
];

async function main() {
  var headline = await axios.get(headlineUrl);
  var feeds = [];
  var counter = 0;
    showlist.forEach(function(theUrl) {
      axios({
        method: 'get',
        url: theUrl
      })
      .then(function(response) {
        //data = utf8.encode(response.data);
        data = response.data;
        parseString(data, function(err, result) {
          fds = xmlToFeed(result.rss.channel[0].item);
          feeds = feeds.concat(fds);
          counter++;
          if (counter>=showlist.length) {

              processFeeds(headline.data,feeds);
          }
        });
      })
      .catch(function(err) {
        console.log('error: ', err);
      });
  });
}

function processFeeds(headline,feeds) {
  feeds1 = feeds.sort(function(a, b){return a['updateDate'] < b['updateDate'] });
  feeds = headline.concat(feeds1);
  jsonFeeds = JSON.stringify(feeds);
  const fs = require('fs');
  fs.writeFile("zb-news-stream-feeds.json", jsonFeeds, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

function xmlToFeed(xml) {
  var feeds = [];
  xml.forEach(function(item) {
    var pubDate = new Date(item['pubDate'][0]);
    if (Date.now() - pubDate < 86400000) {
      var feed = {
        uid: item['guid'][0],
        updateDate: pubDate.toISOString(),
        titleText: item['title'][0],
        streamUrl: item['enclosure'][0]['$']['url'],
        mainText: item['itunes:summary'][0]
      };
      //console.log(feed);
      feeds.push(feed);
    }

  });

  return feeds;
  //console.log(feeds);
}
main();
