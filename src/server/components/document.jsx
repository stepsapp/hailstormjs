const React = require('react')

export default ({ children, title }) => (
    <html>
        <head>
            <title>{title}</title>
            <link rel='stylesheet' href='/css/styles.css' />
        </head>
        <body>
            {children}
            <script async defer src='https://buttons.github.io/buttons.js'></script>
            <script src='/client/bundle.js' />
        </body>
    </html>
)
