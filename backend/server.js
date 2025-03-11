import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/gemini.service.js';

dotenv.config();

// using http as it is easier to setup socket io with this
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*" // for now all origins are allowed.
    }
});

// SOCKET IO KE THROUGH HUMARE SERVER SE KEVAL authenticated users hi connect kar sakenge baki nhi not at all
// for that we are creating a middleware

io.use(async (socket, next) => {
    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1]; // here ? means ki agar value jo tum chahte ho wo agar exists karti but define na ho, ya null ho, ya undefined ho to evaluate the expression to undefined without throwing error (safe way to access the needed variables).
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid ProjectId'));
        }

        socket.project = await projectModel.findById(projectId);

        if (!token) {
            return next(new Error('Authentication Error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication Error'));
        }

        socket.user = decoded;
        next();

    } catch (error) {
        return next(error); // next me agar error hai dal ke behejenge then connection nhi hoga.
    }
})


// jabhi koi user humare server se socket io ke through connect hoga tab tab ye call back fuction execute hoga and will print a user connected

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log("a user connected");
    socket.join(socket.roomId);

    socket.on('project-message', async (data) => {

        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '');
            const result = await generateResult(prompt);
            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            });
            // response has been achieved successfully. Now we just have show it in a proper way to make it's visualization easy. Library require is "markdown-to-jsx"
            return;
        }
        // if used io.to then it will send messages of your to you as well as other members :)
    })

    socket.on('disconnect', () => {
        console.log("disconnected");
        socket.leave(socket.roomId);
    });
});



server.listen(port, () => {
    console.log(`Server is listening at ${port}`);
})