# CV Builder

A LaTeX-powered CV builder built with Electron, React, and node-latex. Edit LaTeX on the right, see the PDF preview on the left.

## Requirements

- **LaTeX** (pdflatex) must be installed on your system. Install via [MacTeX](https://www.tug.org/mactex/) (macOS), [MiKTeX](https://miktex.org/) (Windows), or [TeX Live](https://www.tug.org/texlive/) (Linux).

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Or with Bun
pnpm dev:bun   # or: bun run dev
```

## Build

```bash
pnpm build
pnpm build:mac    # macOS
pnpm build:win    # Windows
pnpm build:linux  # Linux
```

## Tech Stack

- **Electron** + **electron-vite** – main process, preload, renderer
- **React** + **TypeScript** – UI
- **node-latex** – LaTeX → PDF compilation
- **@uiw/react-codemirror** + **codemirror-lang-latex** – LaTeX editor with syntax highlighting
