
const React = require('react')

export default ({ children, title }) => (
    <html>
        <head>
            <title>{title} 123</title>
            <link rel='stylesheet' href='/css/styles.css' />
            <script src='/livereload.js' />
        </head>
        <main>
            <div className='container mx-auto'>{children}</div>
        </main>
    </html>
)
