import React from 'react';
import PropTypes from 'prop-types';
import Document from '../components/document';

const HomePage = ({ localization }) => (
  <Document localization={localization}>
    <div className="mt-10 pt-10 text-center">
      <h1 className="text-5xl font-bold mb-5 mt-5">🥳</h1>
      <h1 className="text-5xl font-bold mb-5 mt-5">Congratulations</h1>
      <h2 className="text-black/50 text-6xl">Hailstorm is set up.</h2>
    </div>
  </Document>
);

HomePage.defaultProps = {
  localization: {
    path: '',
    basePath: '',
    locale: 'en',
    locales: ['en'],
  },
};

HomePage.propTypes = {
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default HomePage;

export const locales = () => ['en'];
