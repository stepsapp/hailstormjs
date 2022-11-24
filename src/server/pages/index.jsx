import React from 'react';
import PropTypes from 'prop-types';
import Document from '../components/document';

const HomePage = ({ localization, i18n, hostname }) => (
  <Document localization={localization} i18n={i18n}>
    <div className="mt-10 pt-10 text-center">
      <h1 className="text-5xl font-bold mb-5 mt-5">🥳</h1>
      <h1 className="text-5xl font-bold mb-5 mt-5">Congratulations</h1>
      <h2 className="text-black/50 text-6xl">Hailstorm is set up.</h2>
      <p className="text-black/50 text-sm mt-5">{hostname}</p>
    </div>
  </Document>
);

HomePage.defaultProps = {
  i18n: PropTypes.shape({
    __: PropTypes.func,
  }),
  hostname: '',
  localization: {
    path: '',
    basePath: '',
    locale: 'en',
    locales: ['en'],
  },
};

HomePage.propTypes = {
  i18n: PropTypes.shape({
    __: PropTypes.func,
  }),
  hostname: PropTypes.string,
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default HomePage;
