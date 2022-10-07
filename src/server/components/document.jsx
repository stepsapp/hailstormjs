const React = require('react')

export default ({ children, title, description }) => (
    <html>
        <head>
            <title>{title}</title>
            <meta charSet='utf-8' />
            <meta name='description' content={description} />
            <meta name='viewport' content='width=device-width, initial-scale=1'></meta>
            <link rel='stylesheet' href='/css/styles.css' />
        </head>
        <body>
            {children}
            <script async defer src='https://buttons.github.io/buttons.js'></script>
            <script src='/client/bundle.js' />
        </body>
    </html>
)
