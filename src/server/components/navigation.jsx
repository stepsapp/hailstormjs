import React from 'react';
import PropTypes from 'prop-types';

const NavigationComponent = ({ localization, i18n }) => {
  const { locale } = localization;
  return (
    <div>
      <div className="flex mx-5 my-5 content-center">
        <img className="mt-1 mr-2 block" src="/images/hailstorm.png" style={{ width: 24, height: 24 }} alt="logo" />
        <a className="text-2xl block align-center " href="/">
          Hailstorm
        </a>
        <ul className="mt-1.5 flex ml-4 grow">
          <li className="font-medium hover:underline mr-2">
            <a href={`/${locale}`}>Home</a>
          </li>
          <li className="font-medium hover:underline mr-2">
            <a href={`/${locale}/blog`}>Blog Example</a>
          </li>
        </ul>
        <ul className="mt-1.5 flex ml-4">
          <li className="font-medium mr-2">{i18n.__('This page is also available in')}</li>
          {localization.locales.map((localeItem) => (
            <li key={localeItem} className="font-medium hover:underline mr-2">
              <a href={`/${localeItem}${localization.basePath}`}>{localeItem}</a>
            </li>
          ))}
        </ul>
      </div>
      <hr />
    </div>
  );
};

NavigationComponent.defaultProps = {
  i18n: {
    __: () => {},
  },
  localization: {
    path: '',
    basePath: '',
    locale: 'en',
    locales: ['en'],
  },
};

NavigationComponent.propTypes = {
  i18n: PropTypes.shape({
    __: PropTypes.func,
  }),
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default NavigationComponent;
