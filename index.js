const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const formData = require("form-data");
require("dotenv").config();

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.post("/transcribe", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        
        const form = new formData();
        form.append("file", fs.createReadStream(req.file.path));
        form.append("model", "openai/whisper-large");
        

        const response = await axios.post("https://api.deepinfra.com/v1/openai/audio/transcriptions", form, {
            headers: {
                Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
                ...form.getHeaders(),
            },
        });
        
        // Remove uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});


app.get("/", async (req, res) => {
    res.json("Hello Guys, I am live for work!");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});