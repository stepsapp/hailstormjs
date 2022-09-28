const React = require('react')

export default ({title}) =>  {
    return <h1>{title}</h1>
}

export const pageProperties = async ({ locale }) => {
    var title = 'Hello World';
    switch (locale) {
        case 'de':
            title = 'Hallo Welt'
            break
        case 'es':
            title = 'Hola Mundo'
            break
        case 'fr':
            title = 'Bonjour le monde'
            break
    }
    return { title }
}

export const pageLocales = async () => {
    return ['en', 'de', 'es', 'fr']
}

export const pageStaticPathProperties = async () => {
    return [{ article: 'article-1' }, { article: 'article-2' }]
}
