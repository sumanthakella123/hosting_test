// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add Square Web Payments SDK */}
        <script 
          type="text/javascript" 
          src={`https://${
            process.env.NODE_ENV === 'production' 
              ? 'web' 
              : 'sandbox.web'
          }.squarecdn.com/v1/square.js`}
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}