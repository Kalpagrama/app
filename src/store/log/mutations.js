import assert from 'assert'

const LogLevelEnum = Object.freeze({ ERROR: 'ERROR', WARNING: 'WARNING', INFO: 'INFO', DEBUG: 'DEBUG' })
Object.freeze(LogLevelEnum)

export function init (state) {
  state.initialized = true
  for (let level in LogLevelEnum) {
    state.messages[LogLevelEnum[level]] = []
  }
}

function processInfo (state, logLevelEnum, info) {
  let messages = state.messages[logLevelEnum]
  messages.push(info)
  if (messages.length > 500) messages.splice(0, 250)
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export function error (state, info) {
  processInfo(state, LogLevelEnum.ERROR, info)
}

export function warn (state, info) {
  processInfo(state, LogLevelEnum.WARN, info)
}

export function info (state, info) {
  processInfo(state, LogLevelEnum.INFO, info)
}

export function debug (state, info) {
  processInfo(state, LogLevelEnum.DEBUG, info)
}
