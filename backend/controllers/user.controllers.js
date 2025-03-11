import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // with message wala message console par log hoga
    }

    try {
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();

        delete user._doc.password; //password nhi jayega front-end pe hashing algoriths, number of rounds and etc

        res.status(201).json({ user, token });

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                errors: 'Invalid Credentials'
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ errors: 'Invalid Credentials' });
        }

        const token = await user.generateJWT();
        delete user._doc.password; //password nhi jayega front-end pe hashing algoriths, number of rounds and etc

        return res.status(200).json({ user, token });

    } catch (error) {
        return res.status(400).send(error.message);  // prints message the reason behind difference in error 
    }
}

export const profileController = async (req, res) => {
    // we can create constants or environment variables in postman but not in free tier of thunderclient. beautiful
    // in authorization key of header while setting it's value equal to token it is mandatory to put bearer then space then token value. It's a practice in the industry that we must follow
    res.status(200).send({ user: req.user });
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);
        
        return res.status(200).send({message: "Logged out successfully"});

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getAllUsersController = async(req, res)=>{

    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })
        
        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        });
        
    } catch (error) {
        return res.status(400).send({error: error})
    }
}
