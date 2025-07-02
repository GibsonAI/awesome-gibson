from agno.models.anthropic import Claude
from agno.models.groq import Groq
from agno.models.openai import OpenAIChat


def get_model(model_id: str, api_key: str):
    model_lower = model_id.lower()

    # OpenAI models (GPT, o1, o3, etc.)
    if any(pattern in model_lower for pattern in ["gpt", "o1", "o3", "o4"]):
        return OpenAIChat(id=model_id, api_key=api_key)

    # Anthropic Claude models
    if "claude" in model_lower:
        return Claude(id=model_id, api_key=api_key)

    # Default to Groq for other models (llama, mixtral, gemma, etc.)
    return Groq(id=model_id, api_key=api_key)
