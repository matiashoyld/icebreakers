# Breaking the Ice: Virtual Room Dynamics Simulator

A Next.js application that simulates and visualizes AI agent interactions in virtual breakout rooms, designed to study engagement patterns in online learning environments.

## Overview

This simulator investigates the effectiveness of online learning environments through LLM-based simulations, focusing on:

- **Leadership Dynamics**: Testing designated group leader effects
- **Social Accountability**: Implementing peer recognition systems
- **Gamification**: Exploring point-based incentives

## Setup

### Requirements

- Node.js 18.0 or later
- npm
- PostgreSQL database (or a Neon.tech account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matiashoyld/icebreakers.git
cd icebreakers
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
   - Create a PostgreSQL database or sign up for [Neon.tech](https://neon.tech)
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your credentials. You'll need:
     - A PostgreSQL database (e.g., from [Neon.tech](https://neon.tech))
     - An [OpenAI API key](https://platform.openai.com/api-keys)

   Example `.env` file:
     ```env
     POSTGRES_PRISMA_URL="postgres://user:password@host/database?sslmode=require&pgbouncer=true"
     POSTGRES_URL_NON_POOLING="postgres://user:password@host/database?sslmode=require"
     OPENAI_API_KEY="sk-..."
     ```

4. Initialize the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```plaintext
icebreakers/
├── app/
│   ├── api/        # API routes
│   ├── data/       # Simulation configurations
│   ├── types/      # TypeScript definitions
│   ├── layout.tsx  # App layout
│   └── page.tsx    # Main page
├── components/     # React components
├── lib/           # Utilities and services
│   ├── db.ts      # Database client
│   └── services/  # Business logic
├── prisma/        # Database schema and migrations
└── public/        # Static assets
```

## Features

### Simulation Scenarios

- **Baseline**: Natural engagement patterns
- **Leadership**: Group leader designation
- **Social Accountability**: Peer rating system
- **Gamification**: Point-based incentives

### Analytics

- Engagement metrics
- Camera activation tracking
- Speaking time distribution
- Contribution quality
- Task completion rates
- Satisfaction scoring

## Development

### Database Management

```bash
# Create a new migration after schema changes
npx prisma migrate dev

# Reset the database
npx prisma migrate reset

# Open Prisma Studio to view/edit data
npx prisma studio
```

### Environment Variables

Required environment variables:
- `POSTGRES_PRISMA_URL`: Main database connection URL
- `POSTGRES_URL_NON_POOLING`: Direct database connection URL (no connection pooling)

Optional:
- `NODE_ENV`: Set to "development" for local development

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
