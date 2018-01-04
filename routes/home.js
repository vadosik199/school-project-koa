const _ = require('koa-router')();
const Category = require("../models/category");
const User = require("../models/user");

_.get('/', async (ctx) => {
    var cat = {
        title: "ssaddda"
    };
    await Category.create(cat);
    ctx.body = "home";
});

_.get('/hello',async (ctx) => {
    let cats = await Category.find({}).exec();
    let users = await User.find({}).exec();
    ctx.render('users.pug', {
        users: users
    });
});

module.exports = _;