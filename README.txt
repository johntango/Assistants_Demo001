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

