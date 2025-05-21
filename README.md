# NewsChatbot Frontend

A modern React-based chatbot interface for querying news articles with a clean and responsive UI.

![NewsChatbot Frontend](https://github.com/RahulGopathi/NewsChatbot-FE/workflows/Deploy%20Container/badge.svg)

## Features

- Clean, responsive chat interface
- Real-time interaction with the News Chatbot backend
- Session-based chat history persistence
- Modern UI built with React, TypeScript, and Tailwind CSS
- Containerized for easy deployment

## Tech Stack

- **React**: Frontend library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Docker**: Containerization
- **Nginx**: Web server for production deployment

## Prerequisites

- Node.js 16+
- npm or yarn
- Docker (for containerized deployment)

## Getting Started

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/RahulGopathi/NewsChatbot-FE.git
cd NewsChatbot-FE
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env` file in the root directory with:

```
VITE_BACKEND_API_URL=http://localhost:8000
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Docker Deployment

### Building the Docker Image

```bash
docker build -t newschatbot-fe .
```

### Running the Container

```bash
docker run -p 80:80 -e VITE_BACKEND_API_URL=http://your-backend-api newschatbot-fe
```

### Using GitHub Container Registry

```bash
docker pull ghcr.io/rahulgopathi/newschatbot-fe:latest
docker run -p 80:80 -e VITE_BACKEND_API_URL=http://your-backend-api ghcr.io/rahulgopathi/newschatbot-fe:latest
```

## Project Structure

```
NewsChatbot-FE/
├── src/                    # Source files
│   ├── assets/             # Static assets
│   ├── components/         # Reusable React components
│   ├── services/           # API services
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Entry point
├── public/                 # Public static files
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration for production
└── package.json            # Project dependencies and scripts
```

## Development

### Adding New Components

Place new components in the `src/components` directory with proper naming conventions:

```
src/components/
├── ChatBox/
│   ├── ChatBox.tsx
│   └── ChatBox.css
├── MessageList/
│   └── MessageList.tsx
└── ...
```

### API Integration

The application communicates with the backend using services defined in the `src/services` directory. The main service for chat functionality is located at `src/services/chatService.ts`.

## Deployment

The application is set up for continuous deployment using GitHub Actions. When changes are pushed to the main branch, a new Docker image is built and published to GitHub Container Registry.

For more details, see the workflow file at `.github/workflows/docker-build.yml`.

## License

MIT License
