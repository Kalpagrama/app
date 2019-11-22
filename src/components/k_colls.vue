<template lang="pug">
div(
  :style=`{position: 'relative'}`
  v-touch-pan.left.right.prevent.mouse="handlePan"
  v-touch-swipe.left.right.prevent.mouse="handleSwipe"
  ).row.full-width
  //- debug
  div(
    v-if="debug"
    :style=`{position: 'absolute', top: '0px', zIndex: 1000, background: 'rgba(0,0,0,0.3)'}`).row.full-width.items-center
    small.full-width collsOverflow: {{ collsOverflow }}
    small.full-width value: {{ value }}
    small.full-width colls: {{ colls }}
  //- scroll
  div(
    ref="kCollsScrollWrapper"
    :style=`{position: 'relative', overflow: overflow}`).row.fit.no-wrap.scroll
    div(
      v-for="(c, ckey, ci) in colls" :key="ckey"
      :style=`{...collStyles(c, ckey, ci)}`
      ).row.full-height.items-start.content-start
      slot(:name="ckey")
</template>

<script>
export default {
  name: 'kColls',
  props: ['value', 'colls', 'disable'],
  data () {
    return {
      debug: false,
      controls: false,
      overflow: 'hidden',
      panning: false,
      isFirstMove: false
    }
  },
  watch: {
    value: {
      immediate: true,
      async handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          await this.$wait(300)
          this.$nextTick(() => {
            this.move(to, !this.isFirstMove)
            this.firstMoved = true
          })
        }
      }
    }
  },
  methods: {
    collStyles (c, ckey, ci) {
      let width = c.width ? c.width * 100 + '%' : '100%'
      return {
        width: width,
        minWidth: width,
        maxWidth: width
      }
    },
    handleSwipe (e) {
      this.$log('handleSwipe', e)
      switch (e.direction) {
        case 'left': {
          // find next value...
          break
        }
        case 'right': {
          // find prev value...
          break
        }
      }
    },
    handlePan (e) {
      // this.$log('handlePan', e)
      if (!this.debug) return
      if (this.disable) return
      this.$refs.kCollsScrollWrapper.scrollLeft -= e.delta.x
      if (e.isFirst) {
        this.panning = true
        this.overflow = 'auto'
      }
      if (e.isFinal) {
        this.panning = false
        this.oveflow = 'hidden'
        let i = this.$refs.kCollsScrollWrapper.scrollLeft / this.$refs.kCollsScrollWrapper.clientWidth
        if (i < 0 || i > this.colls.length - 1) return
        this.move(Math.round(i))
      }
    },
    move (index, immediate) {
      return new Promise((resolve, reject) => {
        this.$log('move start', index)
        let clientWidth = this.$refs.kCollsScrollWrapper.clientWidth
        let d = 1
        let scrollLeft = (clientWidth * d) * index
        this.$log('scrollLeft', scrollLeft)
        this.overflow = 'auto'
        if (immediate) {
          this.$refs.kCollsScrollWrapper.scrollLeft = scrollLeft
          this.overflow = 'hidden'
          this.$log('move DONE')
        } else {
          this.$tween.to(
            this.$refs.kCollsScrollWrapper,
            0.2,
            {
              scrollLeft: scrollLeft,
              onComplete: () => {
                this.$log('move DONE')
                this.overflow = 'hidden'
              }
            }
          )
        }
      })
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
