const fs = require('fs')

export const execute = (destinationPath) => {
    fs.rmSync(destinationPath, { recursive: true, force: true })
}

