
export function initUtils() {
   Object.assign(RegExp.prototype, {
      toJSON (...args) {
         return this.toString()
      }
   })
   Object.assign(String.prototype, {
      in (...args) {
         // console.log('aasdasd', args.includes(this))
         return args.includes(this)
      },
      notIn (...args) {
         return !args.includes(this)
      }
   })
}

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
