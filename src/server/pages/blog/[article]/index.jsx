import React from 'react';
import PropTypes from 'prop-types';
import Document from '../../../components/document';

const BlogArticlePage = ({ properties, localization }) => {
  const { title, body } = properties;
  return (
    <Document localization={localization}>
      <h1 className="text-2xl mt-10 mb-5">{title}</h1>
      <p>{body}</p>
    </Document>
  );
};

BlogArticlePage.defaultProps = {
  localization: {
    path: '',
    basePath: '',
    locales: ['en'],
  },
  properties: {
    title: '',
    body: '',
  },
};

BlogArticlePage.propTypes = {
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
  properties: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.string,
  }),
};

export default BlogArticlePage;

export const properties = async (data) => {
  const { locale } = data.localization;
  const { article } = data.pathParams;
  const result = await import(`../../../content/${article}`);
  const content = result.default[locale];
  return content;
};

export const locales = async () => ['en', 'de'];

export const staticPathParams = async () => [{ article: 'article-1' }, { article: 'article-2' }];
