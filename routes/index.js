
/*
 * GET home page.
 */
var cheerio = require('cheerio')
  , request = require('request')
  ,	cached = {};

var organisations = [{name:'test1', scrapes:[{name:'test',content:'var s = "test";'}]}, {name:'test2'}];

var updateContent = function() {
    request('http://www.hornsby.nsw.gov.au/council/about-council/contact-us', function(error, resCode, body){
    $ = cheerio.load(body);
   
    var $content = $('#content-main');
    $content.find('fieldset, input, #form-messages, h3').remove();
     var formContents = $content.find('form').html();
    $content.find('form').remove();
    $content.append(formContents);
    var html = $content.html();

    if (!cached.contactUs) {
        cached.contactUs = {};
    };

    if (cached.contactUs.content == html) {
      console.log('No update.');
    }
    else
    {
      cached.contactUs.content = html;
      cached.contactUs.lastUpdated = (new Date()).getTime();
      console.log('Updated');
    }
  });
} 
updateContent();

setInterval(updateContent, 60*1000*5);

exports.index = function(req, res){
  res.render('index', { title: 'Express', organisations:organisations});
};

exports.organisation = function(req, res){
	var organisationName = req.params.organisation;
	var organisation = organisations.filter(function(item){
		if (item.name == organisationName) {
			return item;
		}
	});
	
	if (organisation.length == 0) {
		res.send('Error!');
		return;
	}
	organisation = organisation[0];

  res.render('org', {org:organisation});
};

exports.edit = function(req, res) {
	var organisationName = req.params.organisation,
		key = req.params.key;

	var organisation = organisations.filter(function(item){
		if (item.name == organisationName) {
			return item;
		}
	});
	
	if (organisation.length == 0) {
		res.send('Error!');
		return;
	}
	organisation = organisation[0];

	var scrape = organisation.scrapes.filter(function(item){
		if (item.name == key) {
			return item;
		}
	})

	if (scrape.length == 0) {
		res.send('Scrape not found.');
		return;
	}
	scrape = scrape[0];

	res.render('edit', {org:organisation.name, url:'/api/' + organisation.name + '/' + scrape.name, content: scrape});	
}

exports.save = function(req, res) {
	var post = req.body;

}

exports.serve = function(req, res){  
    if (cached.contactUs){
     res.send(cached.contactUs);
    }
    else
    {
      res.send({error:1, message:'No data in cache.'});
    }
}