const _ = require('koa-router')();
const Koa = require('koa');
const Category = require('../services/category');

_.get('/adminpanel/categories', async (ctx) => {
    let categories = await Category.find({});
    ctx.render('admin-categories', {
        categories: categories
    })
});

_.get('/adminpanel/categories/new', async (ctx) => {
    ctx.render('admin-create-category');
});

_.post('/adminpanel/categories/new', async (ctx) => {
    if(!ctx.request.body.title) {
        throw new Error('Усі поля мусять бути заповнені!');
    }
    else {
        let category = {
            title: ctx.request.body.title
        };
        let created = await Category.create(category);
        ctx.response.redirect('/adminpanel/categories');
    }
});

_.get('/adminpanel/categories/edit/:id', async (ctx) => {
    let category = await Category.findById({_id: ctx.params.id});
    if(!category) {
        throw new Error('Не вдалося знайти категорію з вказаним ідентифікаторм!');
    }
    else {
        ctx.render('admin-edit-category', {
            category: category
        });
    }
});

_.post('/adminpanel/categories/edit', async (ctx) => {
    if(!ctx.request.body.title) {
        throw new Error('Усі поля мусять бути заповнені!');
    }
    else {
        let needToUpdate = {
            title: ctx.request.body.title 
        };
        await Category.update(ctx.request.body.id, needToUpdate);
        ctx.response.redirect('/adminpanel/categories');
    }
});

_.get('/adminpanel/categories/delete/:id', async (ctx) => {
    let category = await Category.findById({_id: ctx.params.id});
    if(!category) {
        throw new Error('Не вдалося знайти категорію з вказаним ідентифікаторм!');
    }
    else {
        ctx.render('admin-delete-category', {
            category: category
        });
    }
});

_.post('/adminpanel/categories/delete', async (ctx) => {
    let category = await Category.findById(ctx.request.body.id);
    if(!category) {
        throw new Error('Не вдалося видалити категорію. Не вірно вказаний ідентифікатор!');
    }
    await category.remove();
    ctx.response.redirect('/adminpanel/categories');
});

module.exports = _;