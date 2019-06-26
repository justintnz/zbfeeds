const axios = require('axios');
axios({
  method: 'get',
  url: 'https://www.newstalkzb.co.nz/rss/podcasts-source/newstalk-zbs-early-edition-source/'
})
  .then(function(response) {
    console.log(response.data);
});
