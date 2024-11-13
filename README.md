# Breaking the Ice: Virtual Room Dynamics Simulator

A Next.js application that simulates and visualizes AI agent interactions in virtual breakout rooms, designed to study engagement patterns in online learning environments.

## Overview

This simulator investigates the effectiveness of online learning environments through LLM-based simulations, focusing on:

- **Leadership Dynamics**: Testing designated group leader effects
- **Social Accountability**: Implementing peer recognition systems
- **Gamification**: Exploring point-based incentives

Common challenges we're addressing:

- Low participation rates
- Uneven contribution among members
- Lack of clear direction
- Difficulty in measuring engagement

## Technical Stack

### Agent System

- Memory-enabled AI agents
- Decision-making based on "excitement scores"
- Context-aware interaction system
- Real-time state management

### Core Features

- Turn-based interactions
- Multiple simulation scenarios
- Real-time analytics
- Interactive visualizations

## Setup

### Requirements

- Node.js 18.0 or later
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/matiashoyld/icebreakers.git
cd icebreakers

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```plaintext
icebreakers/
├── app/
│   ├── data/       # Simulation configurations
│   ├── types/      # TypeScript definitions
│   ├── layout.tsx  # App layout
│   └── page.tsx    # Main page
├── components/
│   └── EngagementChart.tsx
└── public/
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
