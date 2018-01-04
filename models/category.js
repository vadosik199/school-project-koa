const {mongoose} = require("koa-mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
	title: {
		type: String,
		default: '',
		required: true,
		trim: true,
		unique: true
	}
});

var category = mongoose.model("Category", CategorySchema);

module.exports = category;