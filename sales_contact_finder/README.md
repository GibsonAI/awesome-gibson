# 🧩 Sales Contact Finder (CrewAI + GibsonAI)

A plug-and-play crew that finds company contacts and stores them in your [GibsonAI](https://app.gibsonai.com) database.

> 📁 This example lives inside the [`awesome-gibson`](https://github.com/GibsonAI/awesome-gibson) repo, a curated collection of real-world integrations built with [GibsonAI](https://gibsonai.com).

---

## ✨ What It Does

- Uses [CrewAI](https://github.com/crewAIInc/crewAI) to power a research crew
- Scrapes websites and searches with Serper.dev
- Automatically stores company + contact info to a Gibson-hosted schema

---

## 🔧 Setup Instructions

### 1. Clone the `awesome-gibson` repo

```bash
git clone https://github.com/GibsonAI/awesome-gibson.git
cd awesome-gibson/sales_contact_finder
```

---

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Update `.env` with your keys:

```env
GIBSON_API_KEY=your_gibson_api_key
SERPER_API_KEY=your_serper_api_key
OPENAI_API_KEY=your_openai_api_key
```

> ✅ Need a Serper key? [Sign up here](https://serper.dev/)

---

### 3. Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
```

---

### 4. Install dependencies

```bash
pip install crewai==0.108.0
pip install -e .  # uses pyproject.toml in sales_contact_finder
```

---

## 🚀 Running the Crew

From inside `sales_contact_finder/`:

```bash
cd awesome-gibson/sales_contact_finder
python main.py run
```

---

## 🧠 Set Up GibsonAI Schema

In [GibsonAI](https://app.gibsonai.com), use the following prompt to create your schema:

```
- I want to create a sales contact aggregator agent. It will store company and contact information.
- Generate a “sales_contact” table with fields (company_id, name, title, linkedin_url, phone, email). Also create a “sales_company” table with fields (name). All string fields, except name, are nullable.
```

This will give you API endpoints and a key — place them in your `.env`.

---

## 📁 Project Structure

```
awesome-gibson/
└── sales_contact_finder/
    ├── pyproject.toml
    ├── .env.example
    ├── src/
    │   ├── crew.py
    │   └── tools/
    └── examples/
        └── sales_contact_finder/
            └── main.py
```

---

## 📬 Output

Generated contact information will be saved to:

```
output/
└── buyer_contact.md
```
