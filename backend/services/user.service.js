// services folder is created to handle all the request and connection outside of the server. Like server is communicating with databse which is out of server kind of communication. it can be anything, main idea it's external communication.

import userModel from "../models/user.model.js";

export const createUser = async ({
    email, password
}) => {
    if(!email || !password){
        throw new Error('Email and password are required');
    }
    const hashedPassword = await userModel.hashPassword(password); 
    const user = await userModel.create({
        email, password: hashedPassword
    });

    return user;
}

export const getAllUsers = async ({ userId })=>{
    const users = await userModel.find({
        _id: {$ne: userId}
    });
    return users;
}