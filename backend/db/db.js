// ctrl+shift+p  reload window --> in case vs code glitches you can reload it by this method;
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

function connect(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("connected to mongoDB");
    })
    .catch(error=>console.log(error))
}

export default connect;

// THE ERROR THAT OCCURS ALWAYS --> The uri parameter to openUri() must be a string, got "undefined". Make sure the first parameter to mongoose.connect() or mongoose.createConnection() is a string. dotenv config not working and returning undefined