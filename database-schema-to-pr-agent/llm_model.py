from agno.models.groq import Groq
from agno.models.openai import OpenAIChat
from agno.models.anthropic import Claude


def get_model(model_id:str,api_key:str):
    
    if 'gpt' in  model_id.lower():
        return OpenAIChat(id=model_id,api_key=api_key)
    if 'claude' in  model_id.lower():
        return Claude(id=model_id,api_key=api_key)
    
    return Groq(id=model_id,api_key=api_key)
    
    