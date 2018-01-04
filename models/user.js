const {mongoose} = require("koa-mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

function setInitial(str) {
	let str = str.toLowerCase();
	str[0] = str[0].toUpperCase();
	return str;
}

const UserSchema = new Schema({ 
	name: {
		type: String,
		default: '',
		trim: true,
		required: true
	},
	surname: {
		type: String,
		default: '',
		trim: true,
		required: true
	},
	email: {
		type: String,
		default: '',
		trim: true,
		required: true,
		unique: true
	},
	password: {
		type: String,
		default: '',
		trim: true,
		required: true
	},
	photo: {
		type: String,
		default: '',
		trim: true,
		required: false
	},
	isBlocked: {
		type: Boolean,
		default: false
	},
	roles: [{
		type: String,
		enum: ['SuperAdmin', 'Admin', 'Teacher', 'Student']
	}]
});

UserSchema.statics.authenticate = function (email, password, callback) {
  	user.findOne({ email: email }).exec(function (err, user) {
  		console.log(user);
      	if (err) {
        	return callback(err)
      	} 
      	else if (!user) {
        	var err = new Error('User not found.');
        	err.status = 401;
        	return callback(err);
      	}
      	bcrypt.compare(password, user.password, function (err, result) {
        	if (result === true) {
          		return callback(null, user);
        	} 
        	else {
          		return callback();
        	}
      	});
    });
}

UserSchema.methods.isInRole = (roles) => {
	for (role of roles) {
		for(userRole of this.roles) {
			if(userRole === role) 
				return true;
		}
	}
	return false;
}

var user = mongoose.model("User", UserSchema);

module.exports = user;