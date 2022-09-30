import Document from '../../../components/document'

const React = require('react')

export default ({ title, body }) => {
    return (
        <Document>
            <h1>{title}</h1>
            <p>{body}</p>
        </Document>
    )
}

export const pageProperties = async ({ locale }) => {
    var title = 'Sun'
    var body = `The Sun is the star at the center of the Solar System. 
    It is a nearly perfect ball of hot plasma,[18][19] heated to incandescence by nuclear fusion reactions in its core,
    radiating the energy mainly as light, ultraviolet, and infrared radiation. It is the most important source of energy 
    for life on Earth.`
    switch (locale) {
        case 'de':
            title = 'Sonne'
            body = `Die Sonne ist der Stern, der der Erde am nächsten ist und das Zentrum des Sonnensystems bildet. 
    Sie ist ein durchschnittlich großer Stern im äußeren Drittel der Milchstraße. Die Sonne ist ein Zwergstern (Gelber Zwerg), 
    der sich im Entwicklungsstadium der Hauptreihe befindet. Sie enthält 99,86 % der Masse, jedoch nur ca. 0,5 % des Drehimpulses 
    des Sonnensystems.`
            break
        case 'es':
            title = 'Sol'
            break
    }
    return { title, body }
}

export const pageLocales = async () => {
    return ['en', 'de', 'es']
}

export const pageStaticPathProperties = async (data) => {
    return [{ article: 'article-1' }, { article: 'article-2' }]
}
