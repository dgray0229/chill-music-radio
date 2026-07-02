const { withInfoPlist } = require('expo/config-plugins')

module.exports = function withRemoveMicPermission(config) {
  return withInfoPlist(config, (config) => {
    delete config.modResults.NSMicrophoneUsageDescription
    return config
  })
}
