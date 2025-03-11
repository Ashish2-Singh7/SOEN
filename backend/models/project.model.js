import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        // unique: [true, "Project name must be unique"], // this code is working in me but we still note down the teacher's code
        unique: true
    },
    users: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'user' // have to understand it's meaning
        }
    ],
    fileTree:{
        type: Object,
        default: {}
    }
});

const Project = mongoose.model('project', projectSchema);

export default Project;