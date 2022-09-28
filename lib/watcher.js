var nodemon = require('nodemon')

module.exports = () => {
    console.log(__dirname)
    nodemon({
        script: `${__dirname}/main.js`,
        ext: 'js json css jsx html',
        ignore: ['cache/**', 'dist/**'],
    })

    nodemon
        .on('start', function () {
            console.log('Building App.')
        })
        .on('quit', function () {
            console.log('App has quit')
            process.exit()
        })
        .on('restart', function (files) {
            console.log('Re-Building App because of changes.')
        })
}
