
const React = require('react')

export default ({ children, title }) => (
    <html>
        <head>
            <title>{title}</title>
            <link rel='stylesheet' href='/css/styles.css' />
        </head>
        <body>
            <div className='container mx-auto'>{children}</div>
            <script src='/client/bundle.js' />
        </body>
    </html>
)
