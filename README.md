# ClickHouse & Flat File Data Ingestion Tool

A web application for ingesting data into ClickHouse databases or flat files, built with React, Express, and TypeScript.

## Prerequisites

- Node.js v20 or higher
- NPM v10 or higher
- An active ClickHouse instance (if using ClickHouse ingestion)

## Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables in `.env`:

```
DATABASE_URL=your_database_url_here
```

3. Start the development server:

```bash
npm run dev
```

The application will start and be available at `http://0.0.0.0:5000`.

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run check` - Runs TypeScript type checking
- `npm run db:push` - Updates the database schema

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas

## Features

- Data ingestion to ClickHouse databases
- Flat file data export
- Column selection and mapping
- Data preview functionality
- Progress tracking
- Error handling and notifications

## Tech Stack

- React
- Express
- TypeScript
- ClickHouse
- Vite
- Tailwind CSS
- Shadcn UI
- Drizzle ORM
- React Query
