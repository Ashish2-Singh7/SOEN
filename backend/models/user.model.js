import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true, // whitespaces agar hote hai to remove krde 
        lowercase: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must be at least 50 characters long']
    },
    password:{
        type: String,
        select: false // galti se bhi password frontend tak na pauch sake
    }
});

// revision of these concepts 
UserSchema.statics.hashPassword = async function (password) {
    // hashing ka concept
    return await bcrypt.hash(password, 10);
}

UserSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateJWT = function(){
    // token expiry code
    return jwt.sign({email: this.email}, process.env.JWT_SECRET, {expiresIn: '24h'});
}

const User = mongoose.model('user', UserSchema);

export default User;