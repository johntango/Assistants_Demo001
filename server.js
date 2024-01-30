
const express = require('express');
const path = require('path');
const app = express();
const port = 4000;
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');
const fileURLToPath = require("url");
const bodyParser = require('body-parser');



let tools = [{ role:"function", type: "code_interpreter" }, { role:"function",type: "retrieval" }]
//const get_weather = require('./functions/get_weather.js');
const { get } = require('http');


// Serve static images from the 'images' folder
app.use(express.static(__dirname + '/images'));
console.log("dirname: " + __dirname);


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// Define global variables focus to keep track of the assistant, file, thread and run
let focus = { assistant_id: "", file_id: "", thread_id: "", message: "", func_name: "", run_id: "", status: "" };

// Middleware to parse JSON payloads in POST requests
app.use(express.json());



// Serve index.html at the root URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Define routes
app.post('/create_assistant', async (req, res) => {
    tools = [{ type: "code_interpreter" }, { type: "retrieval" }]
    try {
        let response = await openai.beta.assistants.create({
            name: "Test Assistant",
            instructions:
                "You are a personal share price tutor. Write and run code to answer financial questions.",
            tools: tools,
            model: "gpt-4-1106-preview",
        });

        // Log the first greeting
        console.log(
            "\nHello there, I'm your personal share price tutor. Ask some questions.\n"
        );
        focus.assistant_id = await response.id;
        message = "Assistant created with id: " + response.id;
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        return console.error('Error:', error);
    }
}
);

app.post('/modify_assistant', (req, res) => {
    console.log('Modify request received:', req.body);
    res.status(200).json({ message: 'No Modify action available at present', focus: focus });
});

// this lists out all the assistants and extracts the latest assistant id and stores it in focus
app.post('/list_assistants', async (req, res) => {
    try {
        const response = await openai.beta.assistants.list({
            order: "desc",
            limit: 10,
        })
        console.log(`list of assistants ${JSON.stringify(response.data)}`);
        focus.assistant_id = extract_assistant_id(response.data).assistant_id;
        let message = JSON.stringify(response.data);
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        return console.error('Error:', error);
    }
})
function extract_assistant_id(data) {
    let assistant_id = "";
    let tools = []
    if (data.length > 0) {
        assistant_id = data[0].id;
        tools = data[0].tools
    }

    console.log("got assistant_id: " + assistant_id);
    return { assistant_id: assistant_id, tools: tools }
}


app.post('/delete_assistant', async (req, res) => {
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
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        return console.error('Error:', error);
    }
});

app.post('/upload_file', async (req, res) => {
    focus = req.body;
    let file = focus.file_id;  // this is the file name 
    if (!file) {
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
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Upload action failed' });
    }
});

app.post('/create_file', async (req, res) => {
    let data = req.body;
    // get the assistant id from the request as a string
    let assistant_id = data.assistant_id;
    // check that this assistant has either retrieve or code_interpreter active
    if (check_assistant_capability() == true) {
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
            res.status(200).json({ message: message, focus: focus });
        }
        catch {
            message = "Assistant needs to have retrieve or code_interpreter active"
            res.status(200).json({ message: message, focus: focus })
        }
    }
});
// check the active assistant (we only allow one to be active at present)
function check_assistant_capability() {
    if (tools[0].type == "code_interpreter" || tools[0].type == "retrieval") {
        return true
    }
    else { return false }
}

// list files and put the latest file id into focus
app.post('/list_files', async (req, res) => {

    let data = req.body;
    let assistant_id = data.assistant_id;
    try {
        let response = await openai.beta.assistants.files.list(
            assistant_id
        )
        message = response;
        console.log("list_files response: " + JSON.stringify(response));
        // check if files exist
        if (response.data.length > 0) {
            focus.file_id = response.data[0].id;
        }

        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'List files action failed' });
    }
});

app.post('/delete_file', async (req, res) => {
    let data = req.body;
    let assistant_id = data.assistant_id;
    let file_id = data.file_id;
    try {
        let response = await openai.beta.assistants.files.del(
            assistant_id,
            file_id
        )
        message = response;

        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'List files action failed' });
    }
});

app.post('/create_thread', async (req, res) => {
    let assistant_id = req.body.assistant_id;
    try {
        let response = await openai.beta.threads.create(
            /*messages=[
            {
              "role": "user",
              "content": "Create data visualization based on the trends in this file.",
              "file_ids": [focus.file_id]
            }
          ]*/
        )

        message = response;
        console.log("create_thread response: " + JSON.stringify(response));
        focus.thread_id = response.id;
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Thread Create failed' });
    }
});

app.post('/delete_thread', async (req, res) => {
    let thread_id = req.body.thread_id;
    try {
        let response = await openai.beta.threads.del(thread_id)
        message = "Thread deleted with id: " + response.id;
        focus.thread_id = ""
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Thread Delete failed' });
    }
});

app.post('/create_run', async (req, res) => {
    let thread_id = req.body.thread_id;
    let assistant_id = req.body.assistant_id;
    console.log("create_run thread_id: " + thread_id + " assistant_id: " + assistant_id);
    try {
        let response = await openai.beta.threads.runs.create(thread_id, {
            assistant_id: assistant_id
        })
        message = await response;
        focus.run_id = response.id;
        console.log("create_run response: " + JSON.stringify(response));
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Run Delete failed' });
    }
});
//
// this is the main loop in handling messages calling functions etc
//
app.post('/run_status', async (req, res) => {
    let thread_id = req.body.thread_id;
    let run_id = req.body.run_id;
    try {
        let response = await openai.beta.threads.runs.retrieve(thread_id, run_id)
        message = response;
        focus.status = response.status;
        if (response.status === "requires_action") {

            console.log("run status response: " + JSON.stringify(message));
            // extract function to be called from response
            const toolCalls = response.required_action.submit_tool_outputs.tool_calls;
            let toolOutputs = []
            let functions_available = await getFunctions();
            for (let toolCall of toolCalls) {
                console.log("toolCall: " + JSON.stringify(toolCall));
                functionName = toolCall.function.name;
                // get function from functions_available
                let functionToExecute = functions_available[`${functionName}`];

                if (functionToExecute.execute) {
                    let args = JSON.parse(toolCall.function.arguments);
                    let argsArray = Object.keys(args).map((key) => args[key]);
                    let functionResponse = await functionToExecute.execute(...argsArray);
                    toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: JSON.stringify(functionResponse)
                    });
                    let text = JSON.stringify({ message: `function ${functionName} called`, focus: focus });
                    res.write(text);
                    await openai.beta.threads.runs.submitToolOutputs(
                        thread_id,
                        run_id,
                        {
                            tool_outputs: toolOutputs
                        }
                    );
                }
                continue;
            }
            // now continue polling for status 
        }
        if (response.status == "completed" || response.status == "failed") {
            let message = "Completed run with status: " + response.status;
            res.status(200).json({ message: message, focus: focus });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Run Status failed' }, focus);
    }
})


app.post('/delete_run', async (req, res) => {
    let thread_id = req.body.thread_id;
    let assistant_id = req.body.assistant_id;
    let run_id = req.body.run_id;
    try {
        let response = await openai.beta.threads.runs.cancel(thread_id, run_id)
        message = response;
        focus.run_id = response.id;
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Run Delete failed' });
    }
});
app.post('/create_message', async (req, res) => {
    let prompt = req.body.message;
    let thread_id = req.body.thread_id;
    console.log("create_message: " + prompt + " thread_id: " + thread_id);
    try {
        let response = await openai.beta.threads.messages.create(thread_id,
            {
                role: "user",
                content: prompt,
            })
        message = await response;;
        console.log("create message response: " + JSON.stringify(response));
        res.status(200).json({ message: message, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Create  Message failed' });
    }
});

app.post('/get_messages', async (req, res) => {
    let thread_id = focus.thread_id;
    let run_id = focus.run_id;
    console.log("get_messages: on thread_id: " + thread_id + " run_id: " + run_id);
    try {
       
        await get_run_status(thread_id, run_id);
        // now retrieve the messages
        let response = await openai.beta.threads.messages.list(thread_id)
        let all_messages = get_all_messages(response);
        res.status(200).json({ message: all_messages, focus: focus });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Get messages failed' });
    }
});
function get_all_messages(response){
    let all_messages = [];
    let role = "";
    let content = "";
    for (let message of response.data) {
        // pick out role and content
        role = message.role;
        content = message.content[0].text.value;
        all_messages.push({role, content});
    }
    return all_messages
}
//
// this puts a message onto a thread and then runs the assistant 
async function runAssistant(assistant_id,thread_id,user_instructions){
    try {
        await openai.beta.threads.messages.create(thread_id,
            {
                role: "user",
                content: user_instructions,
            })
        let run = await openai.beta.threads.runs.create(thread_id, {
            assistant_id: assistant_id
        })
        run_id = run.id;
        focus.run_id = run_id;
        focus.assistant_id = assistant_id;
        focus.thread_id = thread_id;
        await get_run_status(thread_id, run_id); // blocks until run is completed
        // now retrieve the messages
        let response = await openai.beta.threads.messages.list(thread_id)
        return get_all_messages(response);
        
    }
    catch (error) {
        console.log(error);
        return error;
    }
}
async function get_run_status(thread_id, run_id) {
    try {
        let response = await openai.beta.threads.runs.retrieve(thread_id, run_id)
        let message = response;
        focus.status = response.status;
        let tries = 0;
        while (response.status == 'in_progress' || response.status =="queued" && tries < 10) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 1 second
            response = await openai.beta.threads.runs.retrieve(thread_id, run_id);
            tries += 1;
        }
        if (response.status === "requires_action") {
            get_and_run_tool(response);
        }
        
        if (response.status == "completed" || response.status == "failed") {
            
        }
        // await openai.beta.threads.del(thread_id)
        return
    }
    catch (error) {
        console.log(error);
        return error; 
    }
}

// some code that might be useful
//messages.append({"role": "tool", "tool_call_id": assistant_message["tool_calls"][0]['id'], "name": assistant_message["tool_calls"][0]["function"]["name"], "content": results})

app.post('/list_tools', async (req, res) => {
    let assistant_id = req.body.assistant_id;
    let functions = await getFunctions();
    // I want to loop over dictionary called functions and create a tools array
    let tools = [];
    keys = Object.keys(functions);
    for (let key of keys) {
        tools.push({ role: "function", function: functions[key].details })
    }

    const response = await openai.beta.assistants.update(
        assistant_id,
        { tools: tools }
    )
    console.log("assistant tools updated: " + JSON.stringify(response));
    focus.func_name = "crawlDomainGenEmbeds";
    res.status(200).json({ message: tools, focus: focus });
});

app.post('/run_function', async (req, res) => {
    // Step 1: send the conversation and available functions to the model
    const messages = [
        { role: "user", content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
        tools: tools,
        tool_choice: "auto", // auto is default, but we'll be explicit
    });
    const responseMessage = await response.choices[0].message;
    res.status(200).json({ message: responseMessage, focus: focus });

});
async function getFunctions() {
    const files = fs.readdirSync(path.resolve(__dirname, "./functions"));
    const openAIFunctions = {};

    for (const file of files) {
        if (file.endsWith(".js")) {
            const moduleName = file.slice(0, -3);
            const modulePath = `./functions/${moduleName}.js`;
            // get the two const values from the file
            const { execute, details } = require(`${modulePath}`);

            openAIFunctions[moduleName] = {
                execute,
                details
            };
        }
    }

    return openAIFunctions;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
