import assert from 'assert'

const LogLevelEnum = Object.freeze({ ERROR: 'ERROR', WARNING: 'WARNING', INFO: 'INFO', DEBUG: 'DEBUG' })
Object.freeze(LogLevelEnum)

function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function isString (value) {
  return typeof value === 'string' || value instanceof String;
}

function processInfo (state, logLevelEnum, info) {
  let namespace = 'undefined'
  let message = ''
  let data = null

  if (Array.isArray(info)) {
    assert.ok(info.length >= 2)
    namespace = info[0]
    message = info[1]
    data = info[2]
  } else if (isString(info)) {
    message = info
  } else {
    throw new Error('bad info type!')
  }
  const dbgLog = require('debug')(namespace)
  dbgLog.enabled = true

  dbgLog(message, data)
  let messages = state.messages[logLevelEnum]
  messages.push({message, data})
  if (messages.length > 100) messages.splice(0, 1)
}

export function init (state) {
  state.initialized = true
  for (let level in LogLevelEnum) {
    state.messages[LogLevelEnum[level]] = []
  }
}

export function stateSet (state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
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
