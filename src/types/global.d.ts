
declare global {
  interface Window {
    mermaid?: typeof import('mermaid');
    mermaidInitialized?: boolean;
  }
}