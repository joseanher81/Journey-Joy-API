const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: String,
    photoURL: String,
    online: Boolean,
    theme: String
});

// static signup method
userSchema.statics.signup = async function(email, password) {

    // validations
    if(!email || !password) {
        throw Error('All fields must be filed');
    }
    if(!validator.isEmail(email)) {
        throw Error('Email not valid');
    }
    if(!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough');
    }

    // check if user email already exists
    const exists = await this.findOne({ email });
    if(exists) {
        throw Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.create({ email, password: hashedPassword});

    return user;
}

// static login method
userSchema.statics.login = async function(email, password) {

    // validations
    if(!email || !password) {
        throw Error('All fields must be filled');
    }

    // check if user email exists in db
    const user = await this.findOne({ email} );
    if(!user) {
        throw Error('Invalid credentials');
    }

    // check if provided password matches with the one in db
    const match = await bcrypt.compare(password, user.password);
    if(!match) {
        throw Error('Invalid credentials');
    }

    return user;
}

module.exports = mongoose.model('User', userSchema);