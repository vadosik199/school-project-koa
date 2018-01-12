const Category = require('../models/category');

exports.find = async (obj) => {
    let categories = await Category.find(obj).exec();
    return categories;
}

exports.findOne = async (obj) => {
    let category = await Category.findOne(obj).exec();
    return category;
}

exports.findById = async (id) => {
    let category = await Category.findById(id).exec();
    return category;
}

exports.create = async (obj) => {
    let created = await Category.create(obj);
    return created;
}

exports.update = async (id, obj) => {
    await Category.findByIdAndUpdate(id, obj);
}