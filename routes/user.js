const _ = require('koa-router')();
const Koa = require('koa');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config= require('../config');
const bcrypt = require('bcrypt');
const {User, Token} = require("../models/user");

async function isAuthenicate (ctx, next) {
    if(!ctx.request.user) {
        ctx.response.redirect('/users/login');
    }
    else {
        await next();
    }
}

async function randomToken(val, key) {
    let token = await bcrypt.hash(val, key);
    token = token.replace(new RegExp('\\.|\\/', 'g'), '');
    return token;
}

_.get('/users', isAuthenicate, async (ctx) => {
    let users = await User.find({}).exec();
    ctx.render('admin-users.pug', {
       users: users
    });
});

_.get('/adminpanel/users/id/:id', async (ctx) => {
    let user = await User.findById(ctx.params.id).exec();
    if(!user) {
        throw new Error('Не знайдено користувача з вказаним ідентифікатором!');
    }
    else {
        ctx.render('admin-user.pug', {
            userInfo: user
        });
    }
});

_.get('/user/current', async (ctx) => {
    if(!ctx.request.user) {
        throw new Error('Поточний користувач не автентифікований системою!');
    }
    else {
        let user = await User.findOne({email: ctx.request.user.email}).exec();
        if(!user) {
            ctx.response.redirect('/users/logout');
        }
        else {
            ctx.render('user-info.pug', {
                userInfo: user
            });
        }
    }
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
    let createdUser = await User.create(user);
    let verifyToken = await randomToken(user.email, 10);
    let token = {
        _userId: createdUser._id,
        token: verifyToken
    };
    let createdToken = await Token.create(token);
    var transporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: config.nodemailer.user, 
            pass: config.nodemailer.pass 
        } 
    });
    var mailOptions = { 
        from: 'vadosik.chumack@gmail.com', 
        to: user.email, 
        subject: 'Account Verification Token', 
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + ctx.request.headers.host + '\/users\/confirmation\/id\/' + createdToken.token + '.\n' 
    };
    await transporter.sendMail(mailOptions);
    ctx.response.redirect('/users');
});

_.get('/adminpanel/users/new', async (ctx) => {
    ctx.render('admin-create-user.pug', {
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

_.post('/adminpanel/users/new', async (ctx) => {
    if(!ctx.request.body.name || !ctx.request.body.surname || !ctx.request.body.email) {
        let error = new Error('Усі поля мусять бути заповнені!');
        throw error;
    }
    else {
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
            roles: roles
        };
        let createdUser = await User.create(user);
        let verifyToken = await randomToken(user.email, 10);
        let token = {
            _userId: createdUser._id,
            token: verifyToken
        };
        let createdToken = await Token.create(token);
        var transporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { 
                user: config.nodemailer.user, 
                pass: config.nodemailer.pass 
            } 
        });
        var mailOptions = { 
            from: 'vadosik.chumack@gmail.com', 
            to: user.email, 
            subject: 'Account Verification Token', 
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + ctx.request.headers.host + '\/users\/confirmation\/id\/' + createdToken.token + '.\n' 
        };
        await transporter.sendMail(mailOptions);
        ctx.response.redirect('/users');
    }
});

_.get('/adminpanel/users/edit/:id', async (ctx) => {
    let user = await User.findById(ctx.params.id).exec();
    if(!user) {
        throw new Error('Невдалося знайти користувача з вказаним ідентифікатором!');
    }
    else {
        ctx.render('admin-edit-user', {
            user: user,
            roles: config.roles
        });
    }
});

_.post('/adminpanel/users/edit', async (ctx) => {
    if(!ctx.request.body.name || !ctx.request.body.surname || !ctx.request.body.email) {
        let error = new Error('Усі поля мусять бути заповнені!');
        throw error;
    }
    else {
        let edited = {
            name: ctx.request.body.name,
            surname:ctx.request.body.surname,
            email: ctx.request.body.email 
        };
        let roles = [];
        if(typeof ctx.request.body.roles == 'string') {
            roles.push(ctx.request.body.roles);
        }
        else {
            roles = ctx.request.body.roles
        }
        edited.roles = roles;
        let editedUser = await User.findByIdAndUpdate(ctx.request.body.id, edited);
        ctx.response.redirect('/adminpanel/users/id/' + editedUser._id);
    }
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
        roles: ['SuperAdmin'],
        isVerify: true
    };
    let hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    await User.create(user);
    ctx.response.redirect('/users');
});

_.get('/users/login', (ctx) => {
    ctx.render('login.pug');
});

_.post('/users/login', async (ctx) => {
    let userEmail = ctx.request.body.email;
    let user = await User.findOne({email: userEmail}).exec();
    if(!user) {
        throw new Error('Не знайдено користувача з вказаною електроною скринькою!');
    }
    else {
        let password = ctx.request.body.password
        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            throw new Error('Введено невірний пароль!');
        }
        else {
            if(!user.isVerify) {
                throw new Error('Електронну скриньку не підтвердженно!');
            }
            else {
                if(user.isBlock) {
                    throw new Error('Обліковий запис заблоковано! Зверніться до адміністрації сайту!');
                }
                else {
                    let payload = {
                        id: user._id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        photo: user.photo,
                        isBlocked: user.isBlocked,
                        roles: user.roles
                    };
                    let token = jwt.sign(payload, config.authorisation.secret, {
                        expiresIn: '7days'
                    });
                    ctx.cookies.set('token', token);
                    ctx.response.redirect('/users');
                }
            }
        }
    } 
});

_.get('/users/confirmation/id/:id', async (ctx) => {
    let token = await Token.findOne({token: ctx.params.id}).exec();
    if(!token) {
        throw new Error('Not found');
    }
    else {
        let user = await User.findOne({_id: token._userId}).exec();
        if(!user) {
            throw new Error('Not found');
        }
        else {
            let option = {
                isVerify: true
            };
            let a = await User.findByIdAndUpdate(user._id, option);
            ctx.response.redirect('/users/login');
        }
    }
});

_.get('/users/logout', async (ctx) => {
    ctx.cookies.set('token', null);
    ctx.response.redirect('/');
});

_.post('/users/delete', async (ctx) => {
    await User.remove({_id: ctx.request.body.id});
    ctx.response.redirect('/users');
});

module.exports = _;