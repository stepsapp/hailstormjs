import React from 'react';
import PropTypes from 'prop-types';
import Navigation from './navigation';

const Component = ({ children, title, localization }) => (
  <html lang="en">
    <head>
      <title>{title}</title>
      <link rel="stylesheet" href="/css/styles.css" />
    </head>
    <body>
      <Navigation localization={localization} />
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
