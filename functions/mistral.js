// this is the function that runs the writer assistant
import MistralClient from '@mistralai/mistralai';

const execute = async (prompt) => {
    const apiKey = process.env.MISTRAL_API_KEY;

    const client = new MistralClient(apiKey);

    const chatResponse = await client.chat({
    model: 'mistral-large-latest',
    response_format: {'type': 'json_object'},
    messages: [{role: 'user', content: 'What is the best French cheese? Return the product and produce location in JSON format'}],
    });
    let message = chatResponse.choices[0].message.content;
    console.log('Chat:', chatResponse.choices[0].message.content);
    return message;
}

const details = {
    "name": "mistral",
    "parameters": {
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": "The prompt for Mistral to respond to"
            },
        },
        "required": ["prompt"]
    },
    "description": "This is the prompt for Mistral",
};
module.exports = { execute, details };


