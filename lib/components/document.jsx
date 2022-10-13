import React from 'react';
import PropTypes from 'prop-types';

const Component = ({ children, title }) => (
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

Component.defaultProps = {
  title: '',
  children: '',
};

Component.propTypes = {
  title: PropTypes.string,
  children: PropTypes.string,
};

export default Component;
