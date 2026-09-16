# NATO Alphabet Practice

A progressive web app for practicing NATO phonetic alphabet and radio communication protocols. Features speech recognition for realistic training scenarios including mayday, panpan, and securité calls.

## Features

- **NATO Alphabet Recognition**: Practice identifying and speaking NATO phonetic alphabet letters
- **Radio Calls Training**: Learn and practice standard radio communication phrases:
  - Mayday (emergency)
  - Panpan (urgent non-emergency)
  - Securité (safety warning)
- **Speech Recognition**: Real-time voice input using Vosk for offline speech recognition
- **Progressive Web App**: Install as an app on your device, works offline
- **Ship Identity Practice**: Practice using ship callsigns and identity protocols
- **Session Tracking**: Keep track of practice sessions and progress

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite
- `npm run check-vocab` - Verify model vocabulary
- `npm run lint` - Check code style with ESLint
- `npm run fetch-model` - Download/update Vosk speech model

## Project Structure

```
src/
├── app/              # Application logic and controllers
├── domain/           # Business logic and data models
├── speech/           # Speech recognition engine integration
├── ui/               # UI components and views
└── main.ts          # Entry point

tests/               # Test files
public/              # Static assets
dist/                # Built output
```

## Technology Stack

- **Frontend Framework**: Vanilla TypeScript
- **Build Tool**: Vite
- **Speech Recognition**: Vosk (offline)
- **Testing**: Vitest
- **PWA**: vite-plugin-pwa
- **Linting**: ESLint + TypeScript

## License

Private project
