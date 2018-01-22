const Koa = require('koa');
const app = new Koa();
const mongoose = require('koa-mongoose')
const jwt = require('jsonwebtoken');
const convert = require('koa-convert');
const send = require('koa-send');
const Pug = require('koa-pug');
const fs = require('fs');
const cookie = require('koa-cookie');
const config= require('./config');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const _home = require('./routes/home');
const _user = require('./routes/user');
const _category = require('./routes/category');
const _article = require('./routes/article');
const _gallery = require('./routes/gallery');
const formidable = require('koa2-formidable');

const accessLogStream = fs.createWriteStream(__dirname + '/access.log',{ flags: 'a' });

var pug = new Pug({
    viewPath: './templates'
});

app.use(async (ctx, next) => {
    try {
        await next(); 
    }
    catch(err) {
        ctx.body = err.message
        console.log(err);
    }
});

app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'));

//app.use(bodyParser());
app.use(formidable({
    multiples: true,
    maxFieldsSize: 2 * 1024 * 1024 * 1024
}));

app.use(async (ctx, next) => {
    let regex = new RegExp(/(\.\w+)$/, 'gm');
    let invalid = new RegExp(/^((http|https):\/\/.+\.\w+)$/, 'gm');
    if(!invalid.test(ctx.path) && regex.test(ctx.path)) {
        await send(ctx, ctx.path, { root: __dirname + '/public' });
    }
    else {
        await next();
    }
});

app.use(convert(mongoose({
    user: config.database.user,
    pass: config.database.pass,
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    mongodbOptions:{
        useMongoClient: true,
        poolSize: 5,
        native_parser: true
    }
})));

app.use(async (ctx, next) => {
    let token = ctx.cookies.get('token');
    if(!token) {
        ctx.request.user = undefined;
        pug.locals.user = undefined;
    }
    else {
        jwt.verify(token, config.authorisation.secret, (err, decoded) => {
            if(err) {
                ctx.request.user = undefined;
                pug.locals.user = undefined;
            }
            else {
                ctx.request.user = decoded;
                pug.locals.user = decoded;
            }
        });
    }
    await next();
});

pug.use(app);

app.use(_home.routes());
app.use(_user.routes());
app.use(_category.routes());
app.use(_article.routes());
app.use(_gallery.routes());

app.listen(3030);


