const _ = require('koa-router')();
const bcrypt = require('bcrypt');
const User = require("../models/user");

_.get('/users', async (ctx) => {
    let users = await User.find({}).exec();
    ctx.render('users.pug', {
       users: users 
    });
});

_.get('/users/new', async (ctx) => {
    ctx.render('registration', {
        roles: [
        {
            value: 'Admin',
            title: 'Адміністратор'
        },
        {
            value: 'Teacher',
            title: 'Вчитель'
        },
        {
            value: 'Student',
            title: 'Учень'
        }]
    });
});

_.post('/users/new', async (ctx) => {
    if(!ctx.request.body.name || !ctx.request.body.surname || !ctx.request.body.email || !ctx.request.body.password || !ctx.request.body.roles) {
        let error = new Error('Усі поля мусять бути заповнені!');
        throw error;
    }
    let roles = [];
    if(typeof ctx.request.body.roles == 'string') {
        roles.push(ctx.request.body.roles);
    }
    else {
        roles = ctx.request.body.roles
    }
    let user = {
		name: ctx.request.body.name,
		surname: ctx.request.body.surname,
		email: ctx.request.body.email,
        password: ctx.request.body.password,
        roles: roles
    };
    let hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    await User.create(user);
    ctx.response.redirect('/users');
});

_.get('/users/SuPeRaDmIn', async (ctx) => {
    let option = {
        roles:  'SuperAdmin'
    };
    let superAdmin = await User.findOne(option).exec();
    if(!superAdmin) {
        ctx.render('superAdminCreate.pug');
    }
    else {
        let error = new Error("Not found");
        throw error;
    }                     
});

_.post('/users/SuPeRaDmIn', async (ctx) => {
    let user = {
		name: ctx.request.body.name,
		surname: ctx.request.body.surname,
		email: ctx.request.body.email,
        password: ctx.request.body.password,
        roles: ['SuperAdmin']
    };
    await User.create(user);
    ctx.response.redirect('/users');
});

module.exports = _;