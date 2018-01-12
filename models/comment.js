const {mongoose} = require("koa-mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	text: {
		type: String,
		default: '',
		required: true,
		trim: true
	},
	date: {
		type: Date,
		default: Date.now()
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	authorName: {
		type: String,
		default: '',
		trim: true
	},
	authorEmail: {
		type: String,
		default: '',
		trim: true
	},
	post: {
		type: Schema.Types.ObjectId,
		ref: "Article",
	}
});

var comment = mongoose.model("Comment", CommentSchema);

exports.Comment = comment;