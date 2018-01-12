const _ = require('koa-router')();
const Koa = require('koa');
const Article = require('../models/article');
const Category = require('../models/category');
const mv = require('mv');
var path = require('path');
var appDir = path.dirname(require.main.filename);

_.get('/posts', async (ctx) => {
    var postsQuery = null;
    if(ctx.query.category != undefined) {
        postsQuery = Article.find({category: ctx.query.category});
    }
    else {
        postsQuery = Article.find();
    }
    if(ctx.query.search != undefined) {
        postsQuery = postsQuery.where({
            title: {
                $regex: `${ctx.query.search}`,
                $options: 'i'
            }
        });
    };
    let posts = await postsQuery
                    .populate("author")
                    .populate("category")
                    .sort({created: -1})
                    .exec();
    let latestPosts = await Article.find({})
                                .sort({created: -1})
                                .limit(3)
                                .exec();
    let categories = await Category.find({}).exec();
    ctx.render('posts-blog', {
        title: "Новини",
        posts: posts,
        latestPosts: latestPosts,
        categories: categories
    });
});

_.get('/posts/new', async (ctx) => {
    let categories = await Category.find({}).exec();
    let latestPosts = await Article.find({})
                                .sort({created: -1})
                                .limit(3)
                                .exec();
    ctx.render("create-news", {
        latestPosts: latestPosts,
        categories: categories
    });
});

_.post('/posts/new', async (ctx) => {
    let {body, files} = ctx.request;
    if(!body.title || !body.text || !body.category) {
        throw new Error('Усі поля мусять бути заповнені!');
    }
    else {
        let images = [];
        if(files.image) {
            let oldpath = files.image.path;
            let newFileName = Date.now() +files.image.name;
            let newpath = appDir + '/public/img/news/' + newFileName;
            await saveFile(oldpath, newpath);
            images.push(newFileName);
        }
        let article = {
            title: body.title,
            text: body.text,
            images: images,
            category: body.category,
            author: ctx.request.user.id,
            created: Date.now()
        };
        let created = await Article.create(article);
    }
});

_.post('/posts/saveImage', async (ctx) => {
    let {body, files} = ctx.request;
    let oldpath = files.file.path;
    let newFileName = Date.now() +files.file.name;
    let newpath = appDir + '/public/img/news/' + newFileName;
    await saveFile(oldpath, newpath);
    ctx.body = newFileName;
});

_.get('/posts/id/:id', async (ctx) => {
    let article = await Article.find({_id: ctx.params.id})
                                .populate("author")
                                .populate("category")
                                .populate("comments")
                                .populate({
                                    path: "comments",
                                    populate: {
                                        path: "author"
                                    }
                                })
                                .exec();
    let categories = await Category.find({}).exec();
    let latestPosts = await Article.find({})
                                .sort({created: -1})
                                .limit(3)
                                .exec();
    ctx.render("article-details", {
        title: article.title,
        post: article[0],
        latestPosts: latestPosts,
        categories: categories,
    });
});

function saveFile(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        mv(oldPath, newPath, (err) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}


module.exports = _;