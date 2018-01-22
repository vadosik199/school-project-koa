const {mongoose} = require("koa-mongoose");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
	title: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
	text: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
	description: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
	images: [String],
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: "Category",
		required: false
	},
	created: {
		type: Date,
		default: Date.now()
	},
	comments: [ {
		type: Schema.Types.ObjectId,
		ref: "Comment"
	} ]
});

var article = mongoose.model("Article", ArticleSchema);

module.exports = article;