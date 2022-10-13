/* eslint-disable prefer-destructuring */
const paths = (() => {
  const currentDir = __dirname;
  const isInNodeModules = /^(.*?)node_modules/;
  const isInNodeModulesModule = /^(.*?\/hailstormjs)/;
  const isInLibModules = /^(.*?)lib\/modules/;

  let applicationRoot = null;
  let moduleRoot = null;

  if (currentDir.match(isInNodeModules) && !currentDir.match(isInLibModules)) {
    applicationRoot = isInNodeModules.exec(currentDir)[1];
    moduleRoot = isInNodeModulesModule.exec(currentDir)[1];
  } else if (currentDir.match(isInNodeModules) && currentDir.match(isInLibModules)) {
    applicationRoot = isInNodeModules.exec(currentDir)[1];
    moduleRoot = isInLibModules.exec(currentDir)[1];
  } else if (currentDir.match(isInLibModules)) {
    applicationRoot = isInLibModules.exec(currentDir)[1];
    moduleRoot = isInLibModules.exec(currentDir)[1];
  } else {
    applicationRoot = currentDir;
    moduleRoot = currentDir;
  }
  applicationRoot = applicationRoot.endsWith('/') ? applicationRoot.slice(0, -1) : applicationRoot;
  moduleRoot = moduleRoot.endsWith('/') ? moduleRoot.slice(0, -1) : moduleRoot;

  return { currentDir, applicationRoot, moduleRoot };
})();

module.exports = paths;
