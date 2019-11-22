<template lang="pug">
div(
  :style=`{position: 'relative'}`
  v-touch-pan.left.right.prevent.mouse="handlePan"
  ).column.full-width
  //- debug
  div(
    v-if="debug"
    :style=`{position: 'absolute', top: '0px', zIndex: 1000, background: 'rgba(0,0,0,0.3)'}`).row.full-width.items-center.bg-red
    small.full-width overflow: {{ overflow }}
    small.full-width value: {{ value }}
    small.full-width colls: {{ colls }}
  //- header
  div(
    v-if="header"
    :style=`{minHeight: '60px'}`).row.full-width
    slot(name="header")
  //- body
  .col.full-width
    div(
      ref="kCollsScrollWrapper"
      :style=`{position: 'relative', overflow: overflow}`).row.fit.no-wrap.scroll
      div(
        v-for="(c, ci) in colls" :key="c.id"
        :style=`{width: '100%', minWidth: '100%', maxWidth: '100%'}`
        ).row.full-height.items-start.content-start
        slot(:name="c.id")
</template>

<script>
export default {
  name: 'kColls',
  props: ['coll', 'colls', 'disable', 'header'],
  data () {
    return {
      debug: false,
      controls: false,
      overflow: 'hidden',
      panning: false,
      firstMove: true,
      collIndex: 0
    }
  },
  watch: {
    coll: {
      immediate: true,
      async handler (to, from) {
        this.$log('coll CHANGED', to)
        if (to) {
          this.$nextTick(() => {
            let i = this.colls.findIndex(c => c.id === to)
            this.move(i, this.firstMove)
            if (this.firstMove) this.firstMove = false
            this.collIndex = i
          })
        }
      }
    }
  },
  methods: {
    async handleSwipe (e) {
      let i = e.direction === 'left' ? this.collIndex + 1 : this.collIndex - 1
      if (this.disable || i < 0 || i > this.colls.length - 1 || !this.colls[i]) return
      this.$log('handleSwipe', e)
      this.$emit('coll', this.colls[i].id)
    },
    handlePan (e) {
      if (this.disable) return
      // this.$log('handlePan', e)
      this.$refs.kCollsScrollWrapper.scrollLeft -= e.delta.x
      if (e.isFirst) {
        this.panning = true
        this.overflow = 'auto'
      }
      if (e.isFinal) {
        // this.$log('e.duration', e.duration)
        if (e.duration < 300) {
          this.panning = false
          this.handleSwipe(e)
        } else {
          setTimeout(() => {
            this.panning = false
          }, 500)
          this.oveflow = 'hidden'
          let i = Math.round(this.$refs.kCollsScrollWrapper.scrollLeft / this.$refs.kCollsScrollWrapper.clientWidth)
          // this.$log('i', i)
          let coll = this.colls[i]
          if (coll.id === this.coll) {
            this.$log('SAME SAME SAME')
            this.move(i, false, 0.1)
          } else {
            this.$log('coll.id', coll.id)
            this.$emit('coll', coll.id)
          }
        }
      }
    },
    move (index, immediate, ms) {
      return new Promise((resolve, reject) => {
        // this.$log('move start', index)
        let clientWidth = this.$refs.kCollsScrollWrapper.clientWidth
        let scrollLeft = clientWidth * index
        // this.$log('scrollLeft', scrollLeft)
        this.overflow = 'auto'
        if (immediate) {
          this.$refs.kCollsScrollWrapper.scrollLeft = scrollLeft
          this.overflow = 'hidden'
          // this.$log('move DONE')
        } else {
          this.$tween.to(
            this.$refs.kCollsScrollWrapper,
            ms || 0.15,
            {
              scrollLeft: scrollLeft,
              onComplete: () => {
                // this.$log('move DONE')
                this.overflow = 'hidden'
              }
            }
          )
        }
      })
    }
  }
}
</script>
