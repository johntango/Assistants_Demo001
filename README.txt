# Assistant Manager for experiments
## At present we only allow 1 active Assistant
## Note that to attach a file to an Assistant it must 
## have either "retrieve" or "code_interpret" capabilities.
## At present we create every Assistant with both capabilities.
## 
## To add functions put them into the "function" sub-directory
## All functions will be loaded to the assistant that exist there 
## We use the style proposed by developersdigest/OpenAI_Function_Toolkit_And_Library 
## You must have both "execute" and "details" variables 
## This allows us to dynamically call functions that the LLM requests

To crawlDomain to answer questions is a sophisticated modified from 
btg5679/javascript-openai-web-crawler  It will answer question if possible from 
stored embeddings.  If not it will crawl the web to find the answer.  It will 
then store the answer in the database for future use.  
You may want to delete crawled_urls.csv and contents.csv to start fresh.

The openweather function is a simple function that uses the openweather API to
return the weather for a city.  It is a simple example of how to use an API.
You will need a key from openweather WEATHER_API_KEY to use it.  You can get one for free at
https://openweathermap.org/api




