
/*
 * GET home page.
 */
var cheerio = require('cheerio')
  , request = require('request')
  , fs = require('fs')
  , cached = {};

var organisations = [];
var loadOrganisations = function() {
	fs.readFile('private/organisations.json', function(error, data){
		if (!error) {
			organisations = JSON.parse(data);
		}
	});
}

loadOrganisations(); 

var saveOrganisations = function () {
	fs.writeFile('private/organisations.json', JSON.stringify(organisations),  function(error){
		if (!error){
			console.log('Successfully saved.');
		}
	});
}

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

exports.admin = function(req, res){
	console.log(req.params);
  res.render('index', {organisations:organisations});
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

exports.addOrganisation = function (req, res) {
	var org = req.body.organisation;
	if (organisations.map(function(item){return item.name;}).indexOf(org) === -1) {
		organisations.push({name:org, scrapes:[]});
		res.redirect('/admin?add=success');
	}
	else
	{
		res.redirect('/admin?add=fail');
	}
}

exports.addScrape = function (req, res) {
	var org = req.params.organisation;
	var scrape = req.body;
	var index;
	organisations.forEach(function(item){
		if (item.name == org) {
			index = organisations.indexOf(item);
		}
	});
	if (index !== undefined) {
		organisations[index].scrapes.push(scrape);
		saveOrganisations();
		res.redirect('/admin/' + org +'/?add=success');
		return;
	}
	else
	{
		res.redirect('/admin/' + org +'/?add=fail');
		return;
	}

}

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
	var post = req.post,
		org = req.params.organisation,
		key = req.params.key,
		oIndex,
		sIndex;

	for (var x in organisations) {
		if (organisations[x]['name'] == org) {
			oIndex = x;
		}
	}
	
	if (oIndex == undefined) {
		res.send({status:'fail'});
		return;
	}
	organisation = organisations[x];
	
	for (var y in organisation.scrapes) {
		if (organisation.scrapes[y]['name'] == key) {
			sIndex = y;
		}

	}
	
	if (sIndex == undefined) {
		res.send({status:'fail'});
		return;
	}


	var scrape = organisations[oIndex].scrapes[sIndex];
	scrape.content = req.body.content;
	saveOrganisations();
	res.send({status:'ok'});
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

exports.test = function (req, res) {
	try {
	var url = req.body.url,
		js = req.body.js;
		
	request(url, function(error, resCode, body){
	   if (!error) {
	    $ = cheerio.load(body);
	   	try{ result = new Function(js)(); }
	   	catch(e) {
	   		res.send({error:1, message:e});
	   		return;
	   	}
	   	console.log(result);
	    res.send(result);
	  }
	  else
	  {
	  	res.send({error:1, message:"Couldn't load provided url"});
	  	return;
	  }
  	});

  	}
  	catch (e) {
  		res.send(e);
  	}
}