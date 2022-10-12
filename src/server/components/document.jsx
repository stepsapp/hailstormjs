const React = require('react');

function Component({ children, title }) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body>
        <div className="container mx-auto">{children}</div>
        <script src="/client/bundle.js" />
      </body>
    </html>
  );
}

export default Component;
