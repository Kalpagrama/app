var util = require('util')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const ltgt = require('ltgt')
const createRBT = require('functional-red-black-tree')
const Buffer = require('safe-buffer').Buffer

// In Node, use global.setImmediate. In the browser, use a consistent
// microtask library to give consistent microtask experience to all browsers
if (!window.setImmediate) {
   window.setImmediate = (function () {
      let head = {}
      let tail = head; // очередь вызовов, 1-связный список
      let ID = Math.random(); // уникальный идентификатор

      function onmessage (e) {
         // eslint-disable-next-line eqeqeq
         if (e.data != ID) return; // не наше сообщение
         head = head.next;
         var func = head.func;
         delete head.func;
         func();
      }

      if (window.addEventListener) { // IE9+, другие браузеры
         window.addEventListener('message', onmessage);
      } else { // IE8
         window.attachEvent('onmessage', onmessage);
      }

      return function (func) {
         tail = tail.next = { func: func };
         window.postMessage(ID, '*');
      };
   }());
}
let setImmediate = window.setImmediate

const NONE = {}

// TODO (perf): replace ltgt.compare with a simpler, buffer-only comparator
function gt (value) {
   return ltgt.compare(value, this._upperBound) > 0
}

function gte (value) {
   return ltgt.compare(value, this._upperBound) >= 0
}

function lt (value) {
   return ltgt.compare(value, this._upperBound) < 0
}

function lte (value) {
   return ltgt.compare(value, this._upperBound) <= 0
}

function MemIterator (db, options) {
   AbstractIterator.call(this, db)
   this._limit = options.limit

   if (this._limit === -1) this._limit = Infinity

   const tree = db._store

   this.keyAsBuffer = options.keyAsBuffer !== false
   this.valueAsBuffer = options.valueAsBuffer !== false
   this._reverse = options.reverse
   this._options = options
   this._done = 0

   if (!this._reverse) {
      this._incr = 'next'
      this._lowerBound = ltgt.lowerBound(options, NONE)
      this._upperBound = ltgt.upperBound(options, NONE)

      if (this._lowerBound === NONE) {
         this._tree = tree.begin
      } else if (ltgt.lowerBoundInclusive(options)) {
         this._tree = tree.ge(this._lowerBound)
      } else {
         this._tree = tree.gt(this._lowerBound)
      }

      if (this._upperBound !== NONE) {
         if (ltgt.upperBoundInclusive(options)) {
            this._test = lte
         } else {
            this._test = lt
         }
      }
   } else {
      this._incr = 'prev'
      this._lowerBound = ltgt.upperBound(options, NONE)
      this._upperBound = ltgt.lowerBound(options, NONE)

      if (this._lowerBound === NONE) {
         this._tree = tree.end
      } else if (ltgt.upperBoundInclusive(options)) {
         this._tree = tree.le(this._lowerBound)
      } else {
         this._tree = tree.lt(this._lowerBound)
      }

      if (this._upperBound !== NONE) {
         if (ltgt.lowerBoundInclusive(options)) {
            this._test = gte
         } else {
            this._test = gt
         }
      }
   }
}

util.inherits(MemIterator, AbstractIterator)

MemIterator.prototype._next = function (callback) {
   let key
   let value

   if (this._done++ >= this._limit) return setImmediate(callback)
   if (!this._tree.valid) return setImmediate(callback)

   key = this._tree.key
   value = this._tree.value

   if (!this._test(key)) return setImmediate(callback)

   if (!this.keyAsBuffer) {
      key = key.toString()
   }

   if (!this.valueAsBuffer) {
      value = value.toString()
   }

   this._tree[this._incr]()

   setImmediate(function callNext () {
      callback(null, key, value)
   })
}

MemIterator.prototype._test = function () {
   return true
}

MemIterator.prototype._outOfRange = function (target) {
   if (!this._test(target)) {
      return true
   } else if (this._lowerBound === NONE) {
      return false
   } else if (!this._reverse) {
      if (ltgt.lowerBoundInclusive(this._options)) {
         return ltgt.compare(target, this._lowerBound) < 0
      } else {
         return ltgt.compare(target, this._lowerBound) <= 0
      }
   } else {
      if (ltgt.upperBoundInclusive(this._options)) {
         return ltgt.compare(target, this._lowerBound) > 0
      } else {
         return ltgt.compare(target, this._lowerBound) >= 0
      }
   }
}

MemIterator.prototype._seek = function (target) {
   if (target.length === 0) {
      throw new Error('cannot seek() to an empty target')
   }

   if (this._outOfRange(target)) {
      this._tree = this.db._store.end
      this._tree.next()
   } else if (this._reverse) {
      this._tree = this.db._store.le(target)
   } else {
      this._tree = this.db._store.ge(target)
   }
}

function MemDOWN () {
   alert('asdasd MemDOWN')
   if (!(this instanceof MemDOWN)) return new MemDOWN()

   AbstractLevelDOWN.call(this, {
      bufferKeys: true,
      snapshots: true,
      permanence: false,
      seek: true,
      clear: true
   })

   this._store = createRBT(ltgt.compare)
}

util.inherits(MemDOWN, AbstractLevelDOWN)

MemDOWN.prototype._open = function (options, callback) {
   const self = this
   setImmediate(function callNext () {
      callback(null, self)
   })
}

MemDOWN.prototype._serializeKey = function (key) {
   return Buffer.isBuffer(key) ? key : Buffer.from(String(key))
}

MemDOWN.prototype._serializeValue = function (value) {
   return Buffer.isBuffer(value) ? value : Buffer.from(String(value))
}

MemDOWN.prototype._put = function (key, value, options, callback) {
   const iter = this._store.find(key)

   if (iter.valid) {
      this._store = iter.update(value)
   } else {
      this._store = this._store.insert(key, value)
   }

   setImmediate(callback)
}

MemDOWN.prototype._get = function (key, options, callback) {
   let value = this._store.get(key)

   if (typeof value === 'undefined') {
      // 'NotFound' error, consistent with LevelDOWN API
      return setImmediate(function callNext () {
         callback(new Error('NotFound'))
      })
   }

   if (!options.asBuffer) {
      value = value.toString()
   }

   setImmediate(function callNext () {
      callback(null, value)
   })
}

MemDOWN.prototype._del = function (key, options, callback) {
   this._store = this._store.remove(key)
   setImmediate(callback)
}

MemDOWN.prototype._batch = function (array, options, callback) {
   let i = -1
   let key
   let value
   let iter
   const len = array.length
   let tree = this._store

   while (++i < len) {
      key = array[i].key
      iter = tree.find(key)

      if (array[i].type === 'put') {
         value = array[i].value
         tree = iter.valid ? iter.update(value) : tree.insert(key, value)
      } else {
         tree = iter.remove()
      }
   }

   this._store = tree

   setImmediate(callback)
}

MemDOWN.prototype._iterator = function (options) {
   return new MemIterator(this, options)
}

// Constructor
function FakeLevelDOWN () {
   AbstractLevelDOWN.call(this)
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

module.exports = MemDOWN.default = MemDOWN
// Exposed for unit tests only
module.exports.MemIterator = MemIterator
