import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#002F5E" />

        {/* Apple PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EasyListening" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* SEO */}
        <meta name="description" content="EasyListening.com — Live easy listening radio with synced lyrics, favorites, and more." />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

        {/* Register service worker for PWA installability */}
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistration }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #002F5E;
}
`;

const serviceWorkerRegistration = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function(err) {
      console.warn('SW registration failed:', err);
    });
  });
}
`;
