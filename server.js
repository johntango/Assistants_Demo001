
const express =require('express');
const path = require('path');
const app = express();
const port = 3000;
const fs = require('fs');
const axios = require('axios');
const OpenAI = require( 'openai');
const bodyParser = require('body-parser')   // really important otherwise the body of the request is empty
app.use(bodyParser.urlencoded({ extended: false }));

// get OPENAI_API_KEY from GitHub secrets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Middleware to parse JSON payloads in POST requests
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static('./'));

// Serve index.html at the root URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Define routes
app.post('/create', async(req, res) => {
    console.log('Create request received:', JSON.stringify(req.body));
    res.json({ message: 'Create action performed' });
});

app.post('/modify', (req, res) => {
    console.log('Modify request received:', req.body);
    res.json({ message: 'Modify action performed' });
});

app.post('/list', (req, res) => {
    console.log('List request received:', req.body);
    res.json({ message: 'List action performed' });
});

app.post('/delete', (req, res) => {
    console.log('Delete request received:', req.body);
    res.json({ message: 'Delete action performed' });
});

app.post('/uploadfile', (req, res) => {
    console.log('Upload request received:', req.body);
    res.json({ message: 'Upload action performed' });
});

app.post('/createfile', (req, res) => {
    console.log('Create File request received:', req.body);
    res.json({ message: 'Create File action performed' });
});

app.post('/listfiles', (req, res) => {
    console.log('List Files request received:', req.body);
    res.json({ message: 'List Files action performed' });
});

app.post('/deletefile', (req, res) => {
    console.log('Delete File request received:', req.body);
    res.json({ message: 'Delete File action performed' });
});

app.post('/createthread', (req, res) => {
    console.log('Create Thread request received:', req.body);
    res.json({ message: 'Create Thread action performed' });
});

app.post('/deletethread', (req, res) => {
    console.log('Delete Thread request received:', req.body);
    res.json({ message: 'Delete Thread action performed' });
});

app.post('/createrun', (req, res) => {
    console.log('Create Run request received:', req.body);
    res.json({ message: 'Create Run action performed' });
});

app.post('/cancelrun', (req, res) => {
    console.log('Cancel Run request received:', req.body);
    res.json({ message: 'Cancel Run action performed' });
});
/*
app.post('/prompt', async (req, res) => {
    // get the values from the request 
    console.log(JSON.stringify(req.body));
    const system = req.body.system;
    const user = req.body.user;
    const assistant = req.body.assistant;
    const user2 = req.body.user2;
    console.log("system: " + system)
    let m1 = { "role": "system", "content": "" };
    let m2 = { "role": "user", "content": "" }
    let m3 = { "role": "assistant", "content": "" }
    let m4 = { "role": "user", "content": "" }
    let messages = [];
    // check if system has one or more characters
    if (system.length > 0) {
        m1 = { "role": "system", "content": system };
        console.log("m1: " + JSON.stringify(m1))
        messages.push(m1);
    }
    if (user.length > 0) {
        m2 = { "role": "user", "content": user };
        console.log("m2: " + JSON.stringify(m2))
        messages.push(m2);
    }
    if (assistant.length > 0) {
        m3 = { "role": "assistant", "content": assistant };
        console.log("m3: " + JSON.stringify(m3))
        messages.push(m3);
    }
    if (user2.length > 0) {
        m4 = { "role": "user", "content": user2 };
        console.log("m4: " + JSON.stringify(m4))
        messages.push(m4);
    }
    try {
        await openai.chat.completions.create({
            messages: messages,    // not using m3 at the moment
            model: "gpt-4",
        }).then((response) => {
            console.log(response.choices[0].message);
            console.log("response sent")
            res.send(response.choices[0].message.content);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
});


// Test API key
app.get('/test-key', async (req, res) => {
    console.log("test-key")
    try {
        console.log("in test-key:" + openai.apiKey)
        let prompt = "Say hello world in French";
        await openai.completions.create({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.5,
        }).then((response) => {
            console.log(response.choices[0].text);
            console.log("test-key response sent")
            res.send(response.choices[0].text);
        });
    } catch (error) {
        return console.error('Error:', error);
    }
});
*/
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
