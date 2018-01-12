const Article = require('../models/article');

exports.find = async (obj) => {
    let categories = await Article.find(obj).exec();
    return categories;
}

exports.findOne = async (obj) => {
    let category = await Article.findOne(obj).exec();
    return category;
}

exports.findById = async (id) => {
    let category = await Article.findById(id).exec();
    return category;
}

exports.create = async (obj) => {
    let created = await Article.create(obj);
    return created;
}

exports.update = async (id, obj) => {
    await Article.findByIdAndUpdate(id, obj);
}