# Database Schema-to-PR Agent

An intelligent AI agent that automatically manages database schema changes and creates GitHub pull requests with matching Python model classes. The agent uses [GibsonAI MCP](https://docs.gibsonai.com/ai/mcp-server) for database operations and [GitHub MCP](https://github.com/github/github-mcp-server) for repository management.

![GibsonAI Database Schema-to-PR Agent](./assets/GibsonAI%20PR%20Agent.gif)

## 🚀 Features

- **Database Schema Management**: Update database schemas using natural language
- **Python Model Generation**: Automatically generate Pydantic and SQLAlchemy models
- **GitHub Integration**: Create pull requests with generated code on GitHub
- **Streamlit Interface**: User-friendly web interface for schema requests
- **Dual MCP Integration**: Combines GibsonAI and GitHub MCP servers in Agno AI Agent. 

## 🏗️ Architecture

```
User Request (Streamlit) → Schema-to-PR Agent → GibsonAI MCP → Database Changes
                                            ↓
                                    Python Model Generation
                                            ↓
                                     GitHub MCP → Pull Request
```

## 📋 Prerequisites

### 1. Python 3.10 or higher: With required dependencies

### 2. GibsonAI Account: Create account and Clone the project

   - Create an [GibsonAI account](https://www.gibsonai.com/) for free.
   - To get started easily, you can use a ready database schema. Clone the sample database schema by using this link: https://app.gibsonai.com/clone/F1pq4juReK0KL
   - Alternatively, you can also create a new database schema by prompting in the app.
   - **Important**: Note down your **Project ID** from the GibsonAI dashboard - you'll need this for the `.env` configuration. The Project ID appears in the URL when viewing your project (e.g., `https://app.gibsonai.com/project/YOUR_PROJECT_ID`) or can be found using the CLI command `uvx --from gibson-cli@latest gibson list projects`.

### 3. GibsonAI CLI: Authenticated and configured

   - Install [UV package manager](https://docs.astral.sh/uv/).
   - Open your terminal and run:

   ```bash
   uvx --from gibson-cli@latest gibson auth login
   ```
This logs you into the [GibsonAI CLI](https://docs.gibsonai.com/reference/cli-quickstart) so you can access all the features directly from the terminal or local GibsonAI MCP Server. Agno agent calls this GibsonAI MCP server for database operations.

### 4. GitHub Personal Access Token: With repository permissions
   - Go to GitHub Settings → Developer settings → [Personal access tokens](https://github.com/settings/personal-access-tokens/new)
   - Create token with `repo` scope
   - To learn more about access tokens, please check out the [documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

### 5. API key for either OpenAI or Groq

### 6. Fork the sample Python project

Assume that you are working on a simple travel agency database model. You have already some tables and you want make changes. 

For the following sample repo with Python models: https://github.com/Boburmirzo/travel-agency-database-models

Or you can start everything from scratch by prompting the app to create a new database schema and it generates data models for you.

## ⚙️ Agent Installation

Now you can install the agent project itself.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GibsonAI/awesome-gibson.git
   cd database-schema-to-pr-agent
   ```

2. **Install dependencies with UV**:
   ```bash
   uv sync
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # AI Model Configuration
   MODEL_API_KEY=your_openai_or_groq_api_key
   MODEL_ID=llama-3.3-70b-versatile
   
   # GibsonAI Configuration
   GIBSON_PROJECT_ID=your_gibson_project_id
   
   # GitHub Configuration
   GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
   ```

   **Important**: The `GIBSON_PROJECT_ID` is required so the AI agent knows which specific GibsonAI project database schema to modify. You can find your project ID in the GibsonAI dashboard URL or by using the Gibson CLI command:
   ```bash
   uvx --from gibson-cli@latest gibson list projects
   ```

## 🎯 Usage

### Streamlit Web Interface

1. **Start the application**:
   ```bash
   streamlit run app.py
   ```

2. **Access the interface**: Open `http://localhost:8501`

3. **Make schema requests**: Use natural language to describe your database changes

## 📝 Example Requests

### Adding a New Table

```
Create a new 'notifications' table with:
- id (primary key, auto-increment)
- user_id (foreign key to users table)
- type (varchar, not null)
- title (varchar, not null)
- message (text, nullable)
- read_at (timestamp, nullable)
- created_at (timestamp, default current)

```

### Modifying Existing Table

```
“Add an address field to the travel user table as a string”
```

### Adding Relationships

```
Create a 'user_roles' table for many-to-many relationship:
- id (primary key)
- user_id (foreign key to users)
- role_id (foreign key to roles)
- assigned_at (timestamp, default current)
- assigned_by (foreign key to users, nullable)

Generate models with proper relationships and create a PR.
```

## 🔧 Configuration Options

### GibsonAI Settings

- **Project ID**: Target GibsonAI project for database schema operations (required)
- **Authentication**: Authenticated via GibsonAI CLI

### Model Types

- **Pydantic**: Data validation models
- **SQLAlchemy**: ORM models for database operations
- **Both**: Generate both Pydantic and SQLAlchemy models

### GitHub Settings

- **Repository**: Target repository for pull requests
- **Branch**: Base branch for PRs (default: main)
- **Models Directory**: Where to store generated model files

### Database Support

The agent supports the following databases:
- MySQL
- PostgreSQL (Coming soon...)

## 🛠️ Development

### Project Structure

```
├── agent.py              # Main agent logic
├── app.py                # Streamlit web interface
├── llm_model.py          # LLM model configuration
├── pyproject.toml        # Project dependencies
├── env.example           # Environment variables template
└── README.md             # This file
```
### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **MCP Connection Errors**:
   - Ensure GibsonAI CLI is authenticated
   - Check GitHub token permissions
   - Verify environment variables

2. **GibsonAI Project ID Issues**:
   - Ensure `GIBSON_PROJECT_ID` is set in your `.env` file
   - Verify the Project ID is correct by checking your GibsonAI dashboard
   - Use `uvx --from gibson-cli@latest gibson list projects` to list available projects
   - The Project ID should be a UUID format (e.g., `f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6`)

3. **GitHub PR Creation Failures**:
   - Confirm repository permissions
   - Check branch naming conflicts
   - Verify GitHub token scopes

### Debug Mode

Enable detailed logging:
```python
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GibsonAI MCP](https://github.com/GibsonAI/mcp) for database operations
- [GitHub MCP Server](https://github.com/github/github-mcp-server) for repository management
- [Streamlit](https://streamlit.io/) for the web interface
- [Agno](https://github.com/phidatahq/agno) for agent framework

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review example requests

---

Built with ❤️ using AI and MCP (Model Context Protocol)
