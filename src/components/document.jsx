
const React = require('react')

export default ({ children, title }) => (
    <html>
        <head>
            <title>{title}</title>
            <link rel='stylesheet' href='/css/styles.css' />
        </head>
        <main>
            <div className='container mx-auto'>{children}</div>
        </main>
    </html>
)
