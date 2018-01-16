const _ = require('koa-router')();
const Koa = require('koa');
const Article = require('../models/article');
const Category = require('../models/category');
const config = require('../config');
const {Comment} = require('../models/comment');
const mv = require('mv');
const uploadImg = require('../flickr-save');
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
    if(!body.title || !body.text || !body.category || !body.description) {
        throw new Error('Усі поля мусять бути заповнені!');
    }
    else {
        let images = [];
        if(files.images && files.images.size > 0) {
            let oldpath = files.images.path;
            let newFileName = Date.now() +files.images.name;
            let newpath = appDir + '/public/img/news/' + newFileName;
            await saveFile(oldpath, newpath);
            images.push(newFileName);
        }
        let article = {
            title: body.title,
            text: body.text,
            description: body.description,
            images: images,
            category: body.category,
            author: ctx.request.user.id,
            created: Date.now()
        };
        let created = await Article.create(article);
        ctx.response.redirect('/posts/id/' + created._id);
    }
});

_.post('/posts/saveImage', async (ctx) => {
    let {body, files} = ctx.request;
    let oldpath = files.file.path;
    //let newFileName = Date.now() +files.file.name;
    //let newpath = appDir + '/public/img/news/' + newFileName;
    //await saveFile(oldpath, newpath);
    //let result = await saveFile(oldpath, newpath);
    let result = await uploadImg({
        photos: [{
            title: 'school',
            photo: oldpath
        }]
    });
    ctx.body = result;
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

_.post('/posts/comments/add', async (ctx) => {
    try {
        let {body} = ctx.request;
        let article = await Article.findById(body.postId).exec();
        let comment = {
            text: body.text,
            date: Date.now(),
            post: article._id
        };
        if(ctx.request.user) {
            comment.author = ctx.request.user.id
        }
        else {
            comment.authorName = body.username;
            comment.authorEmail = body.email;
        }
        let created = await Comment.create(comment);
        await Article.findByIdAndUpdate(article._id, {$push: {comments: created._id}});
        ctx.status = 200;
        ctx.body = 'Коментар збережено для перегляду!';
    }
    catch(err) {
        ctx.status = 500;
        ctx.body = 'Не вдалося додати коментар. Спробуйте пізніше!';
    }
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