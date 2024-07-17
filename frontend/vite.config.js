// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(os.homedir(), '.vite-ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(os.homedir(), '.vite-ssl/cert.pem')),
    },
    port: 5173,
  },
});

