# Assistant Manager for experiments jrw@mit.edu (email me if you find issues)
## Thanks to following for their tools 
## References  developersdigest/OpenAI_Function_Toolkit_And_Library
## Reference btg5679/javascript-openai-web-crawler 
## I am using GitHub Codespaces to develop this. So when you fork 
## you may need to change the .devcontainer/devcontainer.json to point to your fork
## We are using NPM and Node so run "npm install" to install all the dependencies 
## In the future you may need to modify the libraries to use the latest eg puppeteer
## Similarly the openai API is changing fairly rapidly so monitor any deprecations of models
## For example a number were deprecated on Jan 4, 2024 
## At present we only allow 1 active Assistant
## Note that to attach a file to an Assistant it must 
## have either "retrieve" or "code_interpret" capabilities.
## At present we create every Assistant with both capabilities.
## 
## To add functions as tools put them into the "function" sub-directory
## All functions in that directory will be loaded to the assistant 
## We use the style proposed by developersdigest/OpenAI_Function_Toolkit_And_Library 
## You must have both "execute" and "details" variables 
## This allows us to dynamically call functions that the LLM requests

# Running the Assistant
## A typical run first run the web server "node server.js"
## This should popup a browser window with the Assistant on port 3000 or 4000 
## There are rows of buttons. The first row is for the Assistant
## Click Create Assistant to create a new Assistant (after the first time you can just use List to load an existing Assistant) You should see the Assistant_ID in the output 
## For now don't load a file.  You can load a file later.  
## Next create a Thread - you should see the Thread_ID in the output
## Now go to Add Tools which will add all the Tools in the function directory + the Retrieval and Code Interpret tools
## Now create a Message. Try this one "What is the weather in Boston?" 
## Now create a Run which will run the Assistant on the Message. 
## Now click Get Status - this will poll every 1/2 second to see if the Assistant is done.  
## Now click Get Message to retrieve any messages on the Thread. You should see the answer to the question.
## At present I have a lot of debug messages to the console.  I will remove them in the future.
## Also there are messages from GPT that are outputted at the botthom of the page in the green area. 
## I give examples of functions you might want to load such as "take screenshot of a web site"
# OpenWeather function - try "What is the weather in Boston?" 
## The openweather function is a simple function that uses the openweather API to
## return the weather for a city.  It is a simple example of how to use an API.
##You will need a key from openweather WEATHER_API_KEY to use it.  You can get one for free at
## https://openweathermap.org/api

## The most sophisticated is the crawlDomain function which will crawl the web to find answers to questions.
## Try "Crawl the Lunarmail.io web site and answer the question "What products does Lunarmail offer?"
## Its  modified from btg5679/javascript-openai-web-crawler  It will answer question if possible from 
## stored embeddings.  If not it will crawl the web to find the answer.  It makes use of RAG to embed the question ## ## tokens and compare them to the embeddings of the web pages.  It uses GPT to figure out "Key" tokens in the question. ## It will then use the best match to answer the question.  If it can't find an answer it will use GPT to generate an ## answer.  It will then store the answer in the database for future use. 
## then store the answer in the database for future use.  
## You may want to delete crawled_urls.csv and contents.csv to start fresh.





