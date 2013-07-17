
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
			checkCache();
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

var checkCache = function() {
	console.log('checking cache..');
	var updating = 0;
    organisations.forEach(function(organisation){
    	
    	if (organisation.scrapes && organisation.scrapes.length > 0) {
    		organisation.scrapes.forEach(function(scrape){
 	
    			if (!scrape.lastUpdated) {
    				scrape.lastUpdated = 0;
    			}

    			if (!scrape.updateInterval) {
    				scrape.updateInterval = 1000 * 60 * 60 * 24;
    			}

    			if ((new Date()).getTime() - scrape.lastUpdated > scrape.updateInterval) {
    				//Lets update!			
    				updating++;

    				request(scrape.url, function(error, resCode, body){
    					console.log('Updating ' + scrape.name, scrape.lastUpdated);
					   if (!error) {
					    $ = cheerio.load(body);
					   	try{ result = new Function(scrape.content)();
					   		scrape.latest = result;
					   		scrape.lastUpdated = (new Date()).getTime();
					   	 }
					   	catch(e) {
					   		console.log('cache scrape error', e);
					   	}
					  }
					  updating --;

					  if (updating == 0) {
					  	saveOrganisations();
					  }
					});
    			}
    		}); 
    	}
    });
} 
checkCache();

setInterval(checkCache, 60*1000);

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
	//Schedule recache
	scrape.lastUpdated = 0;
	checkCache();
	saveOrganisations();
	res.send({status:'ok'});
}

exports.serve = function(req, res){  
    var x, y, organisation, scrape, org = req.params.organisation, key = req.params.key;

   	for (x in organisations) {
   		if (organisations[x]['name'] === org){
   			organisation = organisations[x];
   			for (y in organisation['scrapes']) {
   				scrape = organisation['scrapes'][y];
   				if (scrape.name === key) {
   					if (scrape.latest) {
   						res.send(scrape.latest);
   						return;
   					}
   					else
   					{
   						res.send({error:1, message:'No cached version found.'});
   					}
   				}
   			}
   			res.send({error:1, message:'No scrape found in the specified organisation by that name.'});
   		}
   	}
   	res.send({error:1, message: 'Organisation not found.'});
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