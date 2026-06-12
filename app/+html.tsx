import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>Chill Radio — 24/7 Curated Music</title>
        <meta name="description" content="Your soundtrack for focus and flow. Stream curated lofi, easy listening, and ambient music — no commercials, no interruptions." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Inter:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap" rel="stylesheet" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rootStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rootStyles = `
body {
  overflow: hidden;
  background-color: #0B1A2E;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(77,166,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(77,166,255,0.4); }

/* Glassmorphism helpers for web */
.glass-panel {
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Hover transitions */
.hover-item {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-item:hover {
  background-color: rgba(77, 166, 255, 0.08) !important;
  color: #fff !important;
  transform: translateY(-2px);
}
.hover-glow:hover {
  box-shadow: 0 0 16px rgba(77, 166, 255, 0.3) !important;
  border-color: rgba(77, 166, 255, 0.4) !important;
}


/* Marquee CSS for ScrollingText web fallback */
.marquee-container {
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.marquee-track {
  display: inline-flex;
  white-space: nowrap;
  flex-shrink: 0;
}
.marquee-track.scrolling {
  animation: marqueeSlide var(--marquee-duration, 12s) linear infinite;
  padding-right: 80px;
}
@keyframes marqueeSlide {
  0% { transform: translateX(0); }
  15% { transform: translateX(0); }
  85% { transform: translateX(calc(-100% + var(--container-width, 300px))); }
  100% { transform: translateX(calc(-100% + var(--container-width, 300px))); }
}
`;
