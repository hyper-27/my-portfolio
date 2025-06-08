// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes (important for local development if frontend and backend are on different ports)
app.use(express.json()); // Body parser for JSON requests

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- MongoDB Schema and Model for Projects ---
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '🚀' }, // You can change this to actual image paths
    liveDemoUrl: { type: String },
    githubUrl: { type: String }
});

const Project = mongoose.model('Project', projectSchema);

// --- MongoDB Schema and Model for Contact Messages ---
const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// --- API Routes ---

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new project (for demonstration/admin purposes)
app.post('/api/projects', async (req, res) => {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        liveDemoUrl: req.body.liveDemoUrl,
        githubUrl: req.body.githubUrl
    });
    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const newContactMessage = new ContactMessage({
        name,
        email,
        message
    });

    try {
        await newContactMessage.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

// --- Serve Frontend Static Files (for production deployment) ---
// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// For any other request, serve the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access frontend at http://localhost:${PORT}`);
});