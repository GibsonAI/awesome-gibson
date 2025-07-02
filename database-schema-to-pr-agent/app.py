import streamlit as st
import asyncio
import os
from dotenv import load_dotenv
from agent import run_schema_to_pr_agent
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Get GibsonAI Project ID from environment
GIBSON_PROJECT_ID = os.getenv("GIBSON_PROJECT_ID")

# Initialize session state early
if "messages" not in st.session_state:
    st.session_state.messages = []
if "processing" not in st.session_state:
    st.session_state.processing = False
if "session_id" not in st.session_state:
    # Generate a unique session ID for conversation persistence
    import uuid

    st.session_state.session_id = str(uuid.uuid4())

st.set_page_config(
    page_title="Database Schema-to-PR Agent",
    page_icon="🔄",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={"Report a bug": "https://github.com/your-repo/issues"},
)

# Title and Header
st.title("🔄 Database Schema-to-PR Agent")
st.write(
    "Automatically update database schemas and create GitHub pull requests with matching Python model classes. "
    "This agent uses GibsonAI for database operations and GitHub MCP for repository management."
)

# Sidebar
with st.sidebar:
    st.header("ℹ️ About")
    st.markdown(
        "This application helps you manage database schema changes and automatically generates "
        "corresponding Python model classes with GitHub integration."
    )

    st.markdown("**How it works:**")
    st.markdown(
        "1. **Describe your schema changes** in natural language\n"
        "2. **Agent validates and applies** database schema changes via GibsonAI\n"
        "3. **Generates Python models** (Pydantic/SQLAlchemy) to match the schema\n"
        "4. **Creates a GitHub PR** with the new model files and documentation"
    )

    st.markdown("**Read more on GitHub Repo**")
    st.markdown(
        "[Database Schema-to-PR Agent](https://github.com/GibsonAI/database-schema-to-pr-agent)"
    )

    st.markdown("---")
    st.markdown("**Session Info**")
    st.markdown(f"**Session ID:** `{st.session_state.session_id[:8]}...`")
    st.caption("💡 Chat history is automatically saved and restored")

# Configuration section
st.header("⚙️ Configuration")

# GibsonAI Project ID status
if GIBSON_PROJECT_ID:
    st.success(f"✅ **GibsonAI Project ID:** {GIBSON_PROJECT_ID}")
else:
    st.error(
        "❌ **GibsonAI Project ID not found!** Please set `GIBSON_PROJECT_ID` in your `.env` file."
    )
    st.info(
        "💡 **How to find your Project ID:** Check your GibsonAI dashboard URL or run `uvx --from gibson-cli@latest gibson projects list`"
    )

col1, col2 = st.columns(2)

with col1:
    st.subheader("GitHub Repository")
    github_owner = st.text_input("Repository Owner", placeholder="your-username")
    github_repo = st.text_input("Repository Name", placeholder="your-repo-name")

with col2:
    st.subheader("Model Settings")
    models_dir = st.text_input(
        "Models Directory", value="models", help="Directory to store Python model files"
    )
    model_type = st.selectbox("Model Type", ["Pydantic", "SQLAlchemy", "Both"], index=0)

# Main chat interface
st.header("💬 Schema Change Request")

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Schema change examples
with st.expander("📝 Example Schema Requests", expanded=False):
    st.markdown("**Adding a new table:**")
    st.code("""
Create a new 'notifications' table with:
- id (primary key, auto-increment)
- user_id (foreign key to users table)
- type (varchar, not null)
- title (varchar, not null)
- message (text, nullable)
- read_at (timestamp, nullable)
- created_at (timestamp, default current)
    """)

    st.markdown("**Modifying existing table:**")
    st.code("Add an address field to the user table as a string")

    st.markdown("**Adding relationships:**")
    st.code("""
Create a 'user_roles' table for many-to-many relationship:
- id (primary key)
- user_id (foreign key to users)
- role_id (foreign key to roles)
- assigned_at (timestamp, default current)
- assigned_by (foreign key to users, nullable)

Generate models with proper relationships and create a PR.
    """)

# User input
user_query = st.chat_input(
    "Describe your database schema changes..."
    if GIBSON_PROJECT_ID
    else "Please configure GibsonAI Project ID in .env file first",
    disabled=st.session_state.processing or not GIBSON_PROJECT_ID,
)

if user_query and not st.session_state.processing:
    # Validate GibsonAI Project ID
    if not GIBSON_PROJECT_ID:
        st.error(
            "❌ **Error:** GibsonAI Project ID is required. Please set `GIBSON_PROJECT_ID` in your `.env` file."
        )
        st.stop()

    # Add user message to chat
    st.session_state.messages.append({"role": "user", "content": user_query})

    # Display user message
    with st.chat_message("user"):
        st.markdown(user_query)

    # Set processing state
    st.session_state.processing = True

    # Create enhanced prompt with configuration
    enhanced_prompt = f"""
Schema Change Request: {user_query}

Configuration:
- GibsonAI Project ID: {GIBSON_PROJECT_ID}
- GitHub Repository: {github_owner}/{github_repo if github_owner and github_repo else "from environment variables"}
- Models Directory: {models_dir}
- Model Type: {model_type}

Please process this schema change request following the complete workflow:
1. Analyze and apply database schema changes in GibsonAI project {GIBSON_PROJECT_ID}
2. Generate appropriate Python model classes ({model_type})
3. Create a GitHub pull request with the changes

Important: Use GibsonAI project {GIBSON_PROJECT_ID} for all database operations.
    """

    # Process the request
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        message_placeholder.markdown("🔄 Processing schema changes...")

        try:
            # Run the agent with session persistence
            response = asyncio.run(
                run_schema_to_pr_agent(
                    enhanced_prompt, session_id=st.session_state.session_id
                )
            )

            # Display the response
            message_placeholder.markdown(response.content)

            # Add to session state
            st.session_state.messages.append(
                {"role": "assistant", "content": response.content}
            )

            # Success notification
            st.success("✅ Schema changes processed successfully!")

        except ValueError as ve:
            error_msg = f"❌ **Configuration Error:** {str(ve)}"
            message_placeholder.markdown(error_msg)
            st.session_state.messages.append(
                {"role": "assistant", "content": error_msg}
            )
            st.error("Please check your environment variables and configuration.")

        except Exception as e:
            error_msg = f"❌ **Error:** {str(e)}"
            message_placeholder.markdown(error_msg)
            st.session_state.messages.append(
                {"role": "assistant", "content": error_msg}
            )
            st.error("An unexpected error occurred. Please try again.")

        finally:
            # Reset processing state
            st.session_state.processing = False
            st.rerun()

# Status section
st.header("📊 Status")
col1, col2, col3 = st.columns(3)

with col1:
    if st.session_state.messages:
        st.metric(
            "Total Requests",
            len([m for m in st.session_state.messages if m["role"] == "user"]),
        )
    else:
        st.metric("Total Requests", 0)

with col2:
    successful_requests = len(
        [
            m
            for m in st.session_state.messages
            if m["role"] == "assistant" and "✅" in m["content"]
        ]
    )
    st.metric("Successful", successful_requests)

with col3:
    error_requests = len(
        [
            m
            for m in st.session_state.messages
            if m["role"] == "assistant" and "❌" in m["content"]
        ]
    )
    st.metric("Errors", error_requests)

# Clear chat button
if st.button("🗑️ Clear Chat History"):
    st.session_state.messages = []
    st.session_state.processing = False
    st.rerun()

# Footer
st.markdown("---")
st.markdown(
    "Built with [Streamlit](https://streamlit.io/), [Agno](https://www.agno.com/), [GibsonAI MCP](https://github.com/GibsonAI/mcp), "
    "and [GitHub MCP Server](https://github.com/github/github-mcp-server)"
)
