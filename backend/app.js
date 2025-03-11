// going to use es6 
// type : module not common js
// module exports ka revision default and named etc
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/gemini.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
connect();

const app = express();
app.use(cors()); // dekhiye aap ka jo backed hai wo aapke resources lekar baitha hai koi un resources ko access na kar sake iske liye cors kisi bhi url se aa rahi request aur wo origin url ko block krke rakhta hai by default
// for now hum aap.use(cors()) directly likh rahe hai kyuki hum development phase me hai but on production aise nhi hota. Abhi cors.use() krne se humne apna backend open kr diya ab koi bhi kisi bhi urls se humari site par request bhej kar humare website resources ko use kar sakta hai. On production hum particular url ke liye hi aise karte hai and for rest we block them.

app.use(morgan('dev'));
// kisi bhi route par hit karne par console logs the details like what was the request type status code route-address etc.
// app ko initialize krne ke just bad iska use kiya jata hai.  

// must know the meanings of these middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); // cookie parser used when we set token in authorization key of header bearer space token
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);
app.get('/', (req,res)=>{
    res.send('hello world');
})

export default app;

// what is this npx nodemon command without installing(not showing in package.json) we are using nodemon.


// redis setup
// a database just like mongodb.The only big difference is that mongodb stores data in hardisk or ssd like devices where redis stores data in ram which makes it way more faster than mognodb in terms of read and write speed but as ram's are costly it is a bit expensive than mongodb. Let's setup this for our app and use it's free tier. 