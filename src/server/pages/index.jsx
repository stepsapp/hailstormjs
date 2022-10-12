import React from 'react';
import Document from '../components/document.jsx';

function Component() {
  return (
    <Document>
      <div className="mt-10 text-center">
        <img className="inline" src="/images/hailstorm.png" style={{ width: 150 }} alt="logo" />
        <h1 className="text-5xl font-bold mb-5 mt-5">HailstormJS</h1>
        <h2>Start editing src/pages/index.jsx</h2>
        <ul className="mt-10">
          <li>Examples:</li>
          <li className="font-medium hover:underline">
            <a href="/blog">Blog Overview</a>
          </li>
          <li className="font-medium hover:underline">
            <a href="/blog/article-1">Blog Article</a>
          </li>
          <li className="font-medium hover:underline">
            <a href="/blog/article-2">Blog Article 2</a>
          </li>
        </ul>
      </div>
    </Document>
  );
}

export default Component;
