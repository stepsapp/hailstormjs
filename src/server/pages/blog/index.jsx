import React from 'react';
import PropTypes from 'prop-types';
import Document from '../../components/document';

const BlogPage = ({ properties, localization }) => {
  const { articles } = properties;
  const { locale } = localization;
  return (
    <Document localization={localization}>
      <div className="container mt-10">
        <h1 className="text-5xl mb-5">Blog</h1>
        <h2 className="mb-5">A example blog</h2>
        {articles.map((article) => (
          <div key={article.path}>
            <div className="my-5">
              <a className="text-2xl mb-2 block hover:underline" href={`/${locale}/blog/${article.path}`}>
                {article.title}
              </a>
              <p>
                {article.body.substring(0, 255)}
                ...
              </p>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </Document>
  );
};

BlogPage.defaultProps = {
  localization: {
    path: '',
    basePath: '',
    locale: 'en',
    locales: ['en'],
  },
  properties: {
    articles: [
      {
        path: '',
        title: '',
        body: '',
      },
    ],
  },
};

BlogPage.propTypes = {
  localization: PropTypes.shape({
    path: PropTypes.string,
    basePath: PropTypes.string,
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
  }),
  properties: PropTypes.shape({
    articles: PropTypes.arrayOf({
      title: PropTypes.string,
      body: PropTypes.string,
    }),
  }),
};

export default BlogPage;

export const properties = async (data) => {
  const { locale } = data.localization;
  const article1Result = await import('../../content/article-1');
  const article2Result = await import('../../content/article-2');
  const articles = [];
  articles.push(article1Result.default[locale]);
  articles.push(article2Result.default[locale]);
  return { articles };
};

export const locales = async () => ['en', 'de'];
