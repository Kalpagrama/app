<template lang="pug">
div(
  :style=`{position: 'relative'}`
  v-touch-pan.left.right.prevent.mouse="handlePan"
  ).row.full-width
  //- debug
  div(
    v-if="debug"
    :style=`{position: 'absolute', top: '0px', zIndex: 1000, background: 'rgba(0,0,0,0.3)'}`).row.full-width.items-center
    small.full-width collsOverflow: {{ collsOverflow }}
    small.full-width collCurrent: {{ collCurrent }}
    small.full-width value: {{ value }}
    small.full-width colls: {{ colls }}
  //- controls
  div(
    v-if="controls"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '50px', background: 'rgba(0,0,0,0.3)'}`
    ).row.full-width.items-center.q-px-xs
    q-btn(
      v-if="collCurrent !== 0"
      round color="accent" icon="keyboard_arrow_left" @click="backward()")
    .col
    q-btn(
      v-if="collCurrent < count - 1"
      round color="accent" icon="keyboard_arrow_right" @click="forward()")
  //- scroll
  div(
    ref="kCollsScrollWrapper"
    :style=`{position: 'relative', overflow: collsOverflow}`).row.fit.no-wrap.scroll
    div(
      v-for="(c, ci) in colls" :key="c"
      :style=`{width: '100%', minWidth: '100%', maxWidth: '100%'}`
      ).row.full-height.items-start.content-start
      slot(:name="c")
</template>

<script>
export default {
  name: 'kColls',
  props: ['value', 'colls', 'disable'],
  data () {
    return {
      debug: false,
      controls: false,
      collsOverflow: 'hidden',
      collCurrent: 0
    }
  },
  watch: {
    collCurrent: {
      handler (to, from) {
        this.$emit('value', this.colls[to])
        // this.value = to
      }
    },
    value: {
      immediate: false,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          this.collCurrent = this.colls.findIndex(i => i === to)
          this.move(this.collCurrent)
          // this.$nextTick(() => {
          //   this.move(to)
          //   this.$emit('value', to)
          // })
          // this.move(to)
        }
      }
    }
  },
  methods: {
    handleSwipe (e) {
      this.$log('handleSwipe', e)
    },
    handlePan (e) {
      // this.$log('handlePan', e)
      if (this.disable) return
      this.$refs.kCollsScrollWrapper.scrollLeft -= e.delta.x
      if (e.isFirst) this.collsOverflow = 'auto'
      if (e.isFinal) {
        this.collsOverflow = 'hidden'
        let i = this.$refs.kCollsScrollWrapper.scrollLeft / this.$refs.kCollsScrollWrapper.clientWidth
        // this.$log('i', Math.round(i))
        this.move(Math.round(i))
      }
    },
    async backward () {
      this.$log('backward')
      if (this.collCurrent === 0) return
      this.move(this.collCurrent - 1)
    },
    async forward () {
      this.$log('forward')
      if (this.collCurrent === this.count) return
      this.move(this.collCurrent + 1)
    },
    move (index) {
      this.$log('move START', index)
      let clientWidth = this.$refs.kCollsScrollWrapper.clientWidth
      this.$log('clientWidth', clientWidth)
      let scrollLeft = clientWidth * index
      this.$log('scrollLeft', scrollLeft)
      this.collsOverflow = 'auto'
      this.$tween.to(
        this.$refs.kCollsScrollWrapper,
        0.2,
        {
          scrollLeft: scrollLeft,
          onComplete: () => {
            this.$log('move DONE')
            this.collsOverflow = 'hidden'
            this.collCurrent = index
          }
        }
      )
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
