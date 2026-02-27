
import { useEffect } from 'react';
import "../styles/pulse.css";

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return <Component {...pageProps} />;
}
