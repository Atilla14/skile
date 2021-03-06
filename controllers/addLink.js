var Link = require('../models/Link.js');
var Category = require('../models/Category.js');
var Type = require('../models/Type.js');

exports.getAddLink = function(req, res, next){
	Type.find({}).limit(5).sort({'addedOn':1}).exec(function(err, types){
		if(err) return console.error(err);
		if(types){
			res.render('addLink', {
				'title' : 'AddLink',
				types:types
			});
		}else{
			req.flash('errors', { msg: 'Types not found!' });			
			res.render('addLink', {
				'title' : 'AddLink'
			});
		}
	});	
};

exports.postLink = function(req, res, next){
	Category.findOne({'title': {$regex: new RegExp('^'+ req.body.category + '$', "i")}}, function(err, cat){
		if(err) return console.error(err);
		if(cat){
			var newLink = new Link(req.body);
			newLink.addedOn = new Date();
			newLink.tags = req.body.tags.replace(/\s/g, "").split(",");
			newLink._creator = req.user._id;
			newLink._categoryId = cat._id;
			newLink._category = cat.title;
			newLink.type = req.body.type;
			newLink.save(function(err, result){
				if(err) return console.error(err);
				req.flash('success', { msg: 'Link has been successfully added to '+cat.title+' !' });
				Type.find({}).limit(5).sort({'addedOn':1}).exec(function(err, types){
					if(err) return console.error(err);
					if(types){
						res.render('addLink', {
							'title' : 'AddLink',
							types:types
						});
					}else{
						req.flash('errors', { msg: 'Types not found!' });			
						res.render('addLink', {
							'title' : 'AddLink'
						});
					}
				});
			});
		}
		else{
			req.flash('errors', { msg: 'Category not found!' });
			res.render('addLink', {
					'title' : 'AddLink'
			});
		}
	});	
};