const Koa = require('koa');
const app = new Koa();
const mongoose = require('koa-mongoose')
const convert = require('koa-convert');
const send = require('koa-send');
const Pug = require('koa-pug');
const fs = require('fs');
const config= require('./config');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const _home = require('./routes/home');
const _user = require('./routes/user');

const accessLogStream = fs.createWriteStream(__dirname + '/access.log',{ flags: 'a' });

var pug = new Pug({
    viewPath: './templates'
});

app.use(async (ctx, next) => {
    try {
        await next(); 
    }
    catch(err) {
        ctx.body = err.message;
    }
});

app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'));

app.use(bodyParser());

app.use(async (ctx, next) => {
    let regex = new RegExp(/(\.\w+)$/, 'gm');
    if(regex.test(ctx.path)) {
        await send(ctx, ctx.path, { root: __dirname + '/public' });
    }
    else {
        await next()
    }
});

pug.use(app);

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

app.use(_home.routes());
app.use(_user.routes());

app.listen(3030);


