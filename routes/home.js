const _ = require('koa-router')();
const Article = require('../models/article');
const Category = require("../models/category");
const User = require("../models/user");

_.get('/', async (ctx) => {
    let articles = await Article.find({})
		                    .populate("author")
		                    .populate("category")
		                    .sort({created: -1})
		                    .limit(3)
                            .exec();
    ctx.render("news", {
        news: articles,
        title: "Головна сторінка"
    });
});

module.exports = _;