import asyncio
import os
import traceback
from textwrap import dedent

from agno.agent import Agent, RunResponse
from agno.storage.sqlite import SqliteStorage
from agno.tools.mcp import MultiMCPTools
from agno.utils.log import logger
from dotenv import load_dotenv

from llm_model import get_model

INSTRUCTIONS = dedent(
    """\
    You are an intelligent Database Schema-to-PR Agent that helps developers manage database schema changes and corresponding Python model updates and
    creating PRs with model changes on GitHub.

    CRITICAL: NEVER GENERATE PYTHON CODE IN MARKDOWN BLOCKS!
    Instead, always use the GitHub MCP tools to create actual files.

    Your workflow:
    1. **Schema Analysis**: When a user requests schema changes, use GibsonAI MCP tools to:
       - First identify the correct project by project ID
       - Fetch the current database schema from the specified project
       - Apply the requested schema changes using data modeling requests
       - If there is already similar schema change, just return the existing schema
       - Validate the changes by getting the updated schema

    2. **Model Generation**: After successful schema changes in GibsonAI:
       - **IMPORTANT**: Get the EXACT current database schema from GibsonAI using the project schema tool
       - **CRITICAL**: Generate Python models that match EXACTLY what GibsonAI schema returns
       - **DO NOT** show Python code in markdown blocks to the user
       - **INSTEAD**: Use GitHub MCP tools to create the actual Python files
       - Create Pydantic models for data validation with proper imports
       - Include SQLAlchemy models for ORM if requested
       - Use correct type hints and field definitions
       - Handle relationships and constraints properly

    3. **GitHub PR Creation**: Use GitHub MCP tools systematically:
       - Use the create_branch tool to create a new branch
       - Use create_or_update_file tool to add/update Python model files
       - Use create_pull_request tool to create the PR
       - **IMPORTANT**: Use tools one at a time, don't try to call multiple tools in arrays
       - **CRITICAL**: Do not format tool calls as markdown code blocks or JSON arrays

    TOOL USAGE - CRITICAL RULES:
    - NEVER write: ```python ... ``` (markdown code blocks)
    - NEVER write: [{"name": "tool_name", ...}] (JSON arrays)
    - ALWAYS use tools directly to create files
    - Call ONE tool at a time and wait for response
    - When you need to create a Python model, use create_or_update_file tool immediately

    Tool Usage Guidelines:
    - NEVER format tool calls as JSON arrays in markdown blocks
    - NEVER write tool calls as code snippets or examples
    - NEVER show Python code in markdown blocks - use GitHub tools to create files instead
    - Use tools directly through the framework, not as code snippets
    - Call tools one at a time and wait for responses
    - Always check tool responses before proceeding to the next step
    - If a tool fails, provide clear error information to the user
    - When you need to create Python model files, use the create_or_update_file tool immediately
    - EXAMPLE: Don't write `[{"name": "create_branch", ...}]` - just use the tool directly

    Key Capabilities:
    - Database schema modifications (CREATE, ALTER, DROP operations)
    - Python model class generation (Pydantic, SQLAlchemy)
    - GitHub repository integration
    - Pull request automation
    - Code review suggestions

    Guidelines:
    - Always validate schema changes before proceeding
    - Generate clean, well-documented Python code with proper imports
    - Use proper naming conventions (snake_case for DB, PascalCase for classes)
    - Include type hints and docstrings
    - Create meaningful commit messages and PR descriptions
    - Handle errors gracefully and provide clear feedback

    Response Format:
    - Provide step-by-step progress updates
    - DO NOT show generated Python code in markdown blocks
    - Instead, use GitHub tools to create files and report the success
    - Include GitHub PR links when created
    - Summarize what was accomplished
    - When creating Python models, use tools immediately - don't show code first

    Begin by understanding the user's schema change request and proceed systematically through the workflow.
    When you need to create Python models, use the GitHub MCP tools to create the actual files immediately.
    """
)

# Load environment variables from .env file
load_dotenv()

# Model configuration
MODEL_ID = os.getenv("MODEL_ID", "llama-3.3-70b-versatile")
MODEL_API_KEY = os.getenv("MODEL_API_KEY")
if not MODEL_API_KEY:
    raise ValueError("MODEL_API_KEY environment variable is not set.")

# GitHub configuration
GITHUB_TOKEN = os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPO_NAME = os.getenv("GITHUB_REPO_NAME")
DEFAULT_BRANCH = os.getenv("DEFAULT_BRANCH", "main")
MODELS_DIR = os.getenv("MODELS_DIR", "models")


async def run_schema_to_pr_agent(
    message: str, model_id: str | None = None, session_id: str | None = None
) -> RunResponse:
    """
    Runs the Schema-to-PR agent with dual MCP connections (GibsonAI + GitHub) and session storage.

    Args:
        message (str): The message to send to the agent.
        model_id (Optional[str]): The ID of the language model to use.
        session_id (Optional[str]): The session ID for conversation persistence.

    Returns:
        RunResponse: The agent's response.

    Raises:
        RuntimeError: If there is an error connecting to MCP servers.
        ValueError: If required environment variables are missing.
    """
    # Validate GitHub configuration
    if not GITHUB_TOKEN:
        raise ValueError(
            "GitHub configuration incomplete. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable."
        )

    # Set up SQLite storage for session persistence
    storage = SqliteStorage(
        table_name="schema_pr_agent_sessions", db_file="tmp/schema_pr_agent.db"
    )

    # Set up environment for MCP servers
    env = {
        **os.environ,
        "GITHUB_PERSONAL_ACCESS_TOKEN": GITHUB_TOKEN,
    }

    try:
        # Connect to both MCP servers using MultiMCPTools with extended timeout
        async with MultiMCPTools(
            [
                "uvx --from gibson-cli@latest gibson mcp run",
                "npx -y @modelcontextprotocol/server-github",
            ],
            env=env,
            timeout_seconds=300,  # Increase timeout to 5 minutes
        ) as mcp_tools:
            agent = Agent(
                name="Schema-to-PR Agent",
                model=get_model(MODEL_ID, MODEL_API_KEY),
                tools=[mcp_tools],
                instructions=INSTRUCTIONS,
                storage=storage,
                session_id=session_id,
                add_datetime_to_instructions=True,
                add_history_to_messages=True,
                num_history_runs=3,  # Include last 3 conversation turns
                show_tool_calls=True,
            )

            response = await agent.arun(message)
            return response

    except TimeoutError as te:
        print("=== MCP SERVER TIMEOUT ===")
        print("One or more MCP servers failed to start within the timeout period.")
        print("This could be due to:")
        print("1. GibsonAI CLI not authenticated (run 'gibson auth login')")
        print(
            "2. GitHub MCP server not installed (run 'npm install -g @modelcontextprotocol/server-github')"
        )
        print("3. Network connectivity issues")
        print("4. Missing environment variables")
        print("============================")
        raise RuntimeError(f"MCP server timeout: {te}") from te
    except Exception as e:
        print("=== FULL ERROR TRACEBACK ===")
        traceback.print_exc()
        print("============================")
        raise RuntimeError(
            f"Error connecting to MCP servers or running agent: {e}"
        ) from e


async def main():
    """
    Example usage of the Schema-to-PR agent.
    """
    try:
        # Example schema change request
        example_request = """
        Add a new 'user_preferences' table to the database with the following fields:
        - id (primary key)
        - user_id (foreign key to users table)
        - theme (varchar, default 'light')
        - notifications_enabled (boolean, default true)
        - language (varchar, default 'en')
        - created_at (timestamp)
        - updated_at (timestamp)

        Then create a corresponding Python Pydantic model and submit a PR to GitHub.
        """

        response = await run_schema_to_pr_agent(example_request)
        logger.info(f"Agent Response: {response.content}")

    except ValueError as ve:
        logger.error(f"Configuration error: {ve}")
    except RuntimeError as re:
        logger.error(f"Runtime error: {re}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())
