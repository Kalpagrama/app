
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
   },
   toColor(){
      let colors = ['#e51c23', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#5677fc', '#03a9f4', '#00bcd4', '#009688', '#259b24', '#8bc34a', '#afb42b', '#ff9800', '#ff5722', '#795548', '#607d8b']
      let hash = 0;
      if (this.length === 0) return hash;
      for (let i = 0; i < this.length; i++) {
         hash = this.charCodeAt(i) + ((hash << 5) - hash);
         hash = hash & hash;
      }
      hash = ((hash % colors.length) + colors.length) % colors.length;
      return colors[hash];
   }
})

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
