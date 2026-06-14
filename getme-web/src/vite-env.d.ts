// src/vite-env.d.ts
/// <reference types="vite/client" />

// Just tell TypeScript to ignore all custom elements
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
