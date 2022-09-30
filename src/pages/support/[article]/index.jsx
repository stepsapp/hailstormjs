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

    return { title, body }
}