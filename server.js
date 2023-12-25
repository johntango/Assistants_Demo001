
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

// Define global variables focus to keep track of the assistant, file, thread and run
let focus = {assistant_id: "", file_id: "", thread_id: "", run_id: ""};

// Middleware to parse JSON payloads in POST requests
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static('./'));

// Serve index.html at the root URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Define routes
app.post('/create_assistant', async(req, res) => {
    try {
        let response = await openai.beta.assistants.create({
          name: "Test Assistant",
          instructions:
            "You are a personal share price tutor. Write and run code to answer financial questions.",
          tools: [{ type: "code_interpreter" },{type: "retrieval"}],
          model: "gpt-4-1106-preview",
        });
    
        // Log the first greeting
        console.log(
          "\nHello there, I'm your personal share price tutor. Ask some questions.\n"
        );
        focus.assistant_id = await response.id;
        message = "Assistant created with id: " + response.id;
        res.json({message: message, focus: focus});
        }
    catch (error) {
        return console.error('Error:', error);
    }
}   
);

app.post('/modify_assistant', (req, res) => {
    console.log('Modify request received:', req.body);
    res.json({ message: 'Modify action performed' });
});

// this lists out all the assistants and extracts the latest assistant id and stores it in focus
app.post('/list_assistants', async(req, res) => {
    try {
        const response = await openai.beta.assistants.list({
          order: "desc",
          limit:10,
        })
        console.log(`list of assistants ${JSON.stringify(response.data)}`);
        focus.assistant_id = extract_assistant_id(response.data);
        let message = JSON.stringify(response.data);
        res.json({message:message, focus: focus});
        }
    catch (error) { 
        return console.error('Error:', error);
    }
})  
function extract_assistant_id(data) {
    let assistant_id = "";
    if (data.length > 0) assistant_id = data[0].id;
    console.log("got assistant_id: " + assistant_id);
    return assistant_id;
}


app.post('/delete_assistant', async(req, res) => {
    try {
        let assistant_id = req.body.assistant_id;
        console.log("Deleting assistant_id: " + assistant_id);
        const response = await openai.beta.assistants.del(assistant_id);
    
        // Log the first greeting
        console.log(
          `deleted assistant ${JSON.stringify(response)}.\n`
        );
        message = "Assistant deleted with id: " + assistant_id;
        focus.assistant_id = "";
        res.json({message: message, focus: focus});
        }
    catch (error) {
        return console.error('Error:', error);
    }
});

app.post('/upload_file', async(req, res) => {
    focus = req.body;
    let file = focus.file_id;  // this is the file name 
    if(!file) { 
        return res.status(400).send('No files were uploaded.'); 
    }
    try {
        let filestream = fs.createReadStream(file);

        let response = await openai.files.create({
            file: filestream,
            purpose: "assistants"
        }
        )
        message = "File Uploaded with id: " + response.id;
        focus.file_id = response.id;
        res.json({message: message, focus: focus});
    }
    catch(error) {
                console.log(error);
                res.status(500).json({ message: 'Upload action failed' });
            }
});

app.post('/create_file', async(req, res) => {
    let data = req.body;
    // get the assistant id from the request as a string
    let assistant_id = data.assistant_id;
    let file_id = data.file_id;  // this is the file id
    console.log("in create_file assistant_id: " + assistant_id + " file_id: " + file_id);
    try {
        let response = await openai.beta.assistants.files.create(
            assistant_id,
            {
                file_id: file_id
            }
        )
        message = "File Attached to assistant: " + JSON.stringify(response);
        focus.file_id = response.id;
        res.json({message: message, focus: focus});
    }
    catch(error) {
                console.log(error);
                res.status(500).json({ message: 'Create File action failed' });
            }
});



app.post('/list_files', async(req, res) => {
    let data = req.body;
    assistant_id = data.assistant_id;
    try {
        let response = await openai.beta.assistants.files.list(
            assistant_id
        )
        message = response;
    
        res.status(200).json({message: message, focus: focus});
    }
    catch(error) {
                console.log(error);
                res.status(500).json({ message: 'List files action failed' });
            }
});

app.post('/delete_file', async(req, res) => {
    console.log('Delete File request received:', req.body);
    res.json({ message: 'Delete File action performed' });
});

app.post('/create_thread', async(req, res) => {
    console.log('Create Thread request received:', req.body);
    res.json({ message: 'Create Thread action performed' });
});

app.post('/delete_thread', async(req, res) => {
    console.log('Delete Thread request received:', req.body);
    res.json({ message: 'Delete Thread action performed' });
});

app.post('/create_run', (req, res) => {
    console.log('Create Run request received:', req.body);
    res.json({ message: 'Create Run action performed' });
});

app.post('/delete_run', (req, res) => {
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
