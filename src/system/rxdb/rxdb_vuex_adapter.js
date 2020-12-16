import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'

var util = require('util')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
import state from 'src/store'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB)

// Constructor
function FakeLevelDOWN () {
   if (!(this instanceof FakeLevelDOWN)) return new FakeLevelDOWN()
   AbstractLevelDOWN.call(this, {
         bufferKeys: true,
         snapshots: true,
         permanence: false,
         seek: true,
         clear: true
      })
}

// Our new prototype inherits from AbstractLevelDOWN
util.inherits(FakeLevelDOWN, AbstractLevelDOWN)

FakeLevelDOWN.prototype._open = function (options, callback) {
   // Initialize a memory storage object
   this._store = {}

   // Use nextTick to be a nice async citizen
   process.nextTick(callback)
}

FakeLevelDOWN.prototype._serializeKey = function (key) {
   // As an example, prefix all input keys with an exclamation mark.
   // Below methods will receive serialized keys in their arguments.
   return '!' + key
}

FakeLevelDOWN.prototype._put = function (key, value, options, callback) {
   this._store[key] = value
   process.nextTick(callback)
}

FakeLevelDOWN.prototype._get = function (key, options, callback) {
   var value = this._store[key]

   if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return process.nextTick(callback, new Error('NotFound'))
   }

   process.nextTick(callback, null, value)
}

FakeLevelDOWN.prototype._del = function (key, options, callback) {
   delete this._store[key]
   process.nextTick(callback)
}

export default FakeLevelDOWN
