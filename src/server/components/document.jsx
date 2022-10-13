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
  localization: {
    path: '',
    basePath: '',
    locale: '',
    locales: ['en'],
  },
};

Component.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default Component;
