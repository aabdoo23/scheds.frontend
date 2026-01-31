# Scheds Frontend

React + TypeScript + Tailwind CSS + Vite frontend for Scheds.

## Development

1. Start the ASP.NET backend: `cd ../Scheds && dotnet run`
2. Start the frontend: `npm run dev`
3. Open http://localhost:5173

The Vite dev server proxies `/api`, `/Account`, and `/signin-google` to the backend at http://localhost:5254.

## Build

```bash
npm run build
```

Output is in `dist/`. For production, copy `dist/*` to the ASP.NET `wwwroot` and add SPA fallback routing.
