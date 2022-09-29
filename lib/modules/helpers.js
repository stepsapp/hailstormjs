const paths = () => {
    const currentDir = __dirname
    var applicationRoot = null
    var moduleRoot = null
    const isInNodeModules = /^(.*?)node_modules/
    const isInNodeModulesModule = /^(.*?\/hailstormjs)/
    const isInLibModules = /^(.*?)lib\/modules/
    if (currentDir.match(isInNodeModules) && !currentDir.match(isInLibModules)) {
        applicationRoot = isInNodeModules.exec(currentDir)[1]
        moduleRoot = isInNodeModulesModule.exec(currentDir)[1]
    } else if (currentDir.match(isInNodeModules) && currentDir.match(isInLibModules)) {
        applicationRoot = isInNodeModules.exec(currentDir)[1]
        moduleRoot = isInLibModules.exec(currentDir)[1]
    } else if (currentDir.match(isInLibModules)) {
        applicationRoot = isInLibModules.exec(currentDir)[1]
        moduleRoot = isInLibModules.exec(currentDir)[1]
    } else {
        applicationRoot = currentDir
        moduleRoot = currentDir
    }
    return { currentDir, applicationRoot, moduleRoot }
}

module.exports = {
    paths: paths(),
}
