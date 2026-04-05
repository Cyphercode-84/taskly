# Taskly

A full-featured Todoist clone built with React + Vite, backed by Supabase, with an integrated Claude AI assistant.

## Features

- ✅ Tasks with priorities (P1–P4), due dates, labels, projects
- ✅ Subtasks, reminders, recurrence (daily/weekly/monthly)
- ✅ Filters (High Priority, Due This Week, No Due Date)
- ✅ Full-text search
- ✅ AI assistant powered by Claude (adds tasks via natural language)
- ✅ Real-time Supabase backend
- ✅ Roboto font, clean minimal UI

## Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Font**: Google Fonts — Roboto

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/taskly.git
cd taskly
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database

Run the SQL in `sql/setup.sql` in your Supabase dashboard → SQL Editor.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Building for production

```bash
npm run build
```

The output will be in the `dist/` folder. Deploy to Vercel, Netlify, or any static host.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## License

MIT
