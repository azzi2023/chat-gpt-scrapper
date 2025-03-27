# ChatGPT Interface

A web interface for interacting with ChatGPT using Express, TypeScript, and Puppeteer.

## Prerequisites

- Node.js version 23 or higher
- npm (Node Package Manager)
- setup env check example.env for reference

## Installation

1. Install Node.js v23 or higher:
   ```bash
   # Using nvm (Node Version Manager)
   nvm install 23
   nvm use 23
   
   # Or download directly from nodejs.org
   ```

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chat-gpt2.0
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Install nodemon globally (optional but recommended):
   ```bash
   npm install -g nodemon
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```
This will start the application with nodemon, which automatically restarts the server when files change.

### Production Mode
```bash
# First build the TypeScript files
npm run build

# Then start the production server
npm run start:prod
```

### Regular Mode
```bash
# First build the TypeScript files
npm run build

# Then start the server
npm start
```

## Features

- Real-time chat interface with ChatGPT
- Optional login support
- Chat history export to CSV
- Modern UI with responsive design
- Stealth mode for browser automation
- TypeScript support for better type safety

## Project Structure

```
chat-gpt2.0/
├── src/
│   ├── routes/
│   │   └── chat.ts
│   ├── services/
│   │   └── chat.ts
│   └── app.ts
├── views/
│   └── chat.ejs
├── public/
├── exports/
├── dist/           # Compiled JavaScript files
├── tsconfig.json   # TypeScript configuration
└── package.json
```

## TypeScript Configuration

The project uses TypeScript with the following key configurations:
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps for debugging
- Path aliases for cleaner imports

## Environment Variables

The application uses the following environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

If you encounter any issues:

1. Make sure you have Node.js v23 or higher installed
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: 
   ```bash
   rm -rf node_modules
   npm install
   ```
4. Check if all required ports are available
5. For TypeScript compilation errors:
   - Run `npm run build` to see detailed error messages
   - Check the `tsconfig.json` settings
   - Ensure all type definitions are installed
