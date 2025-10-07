# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

- Use [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) for performing the same type checking from the command line, or for generating d.ts files for SFCs.

## Stockfish API configuration

The app uses a local HTTP API (port 8082) that exposes `POST /analyze` to evaluate chess positions and moves.

- Default URL: `http://127.0.0.1:8082/analyze`
- You can override it via a Vite env variable.

Create a `.env.local` file at the project root with:

```
VITE_STOCKFISH_API_URL=http://127.0.0.1:8082/analyze
```

Then run the app with:

```
npm install
npm run dev
```
