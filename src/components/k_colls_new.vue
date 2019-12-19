<template lang="pug">
div(
  ref="scrollWrapper"
  v-touch-pan.left.right.prevent.mouse="handlePan"
  @scroll="onScroll").row.full-width.scroll
  .row.full-width.no-wrap
    div(
      v-for="(c, ci) in colls" :key="n"
      v-if="ci >= collNowIndex - 1 && ci <= collNowIndex + 1"
      :style=`{minWidth: '100%'}`
      ).row.full-width.items-start.content-start.q-px-sm.br
      small.full-width collNowIndex: {{ collNowIndex }}
      span.q-my-xl {{ c.id }}
      //- slot(:name="c.id")
      //- div(
      //-   v-for="(n, ni) in 30*c" :key="ni"
      //-   :style=`{height: '450px'}`
      //-   ).row.full-width.bg-white.q-mb-lg
      //-   span node {{ni}}/{{ci}}
</template>

<script>
export default {
  name: 'kCollsNew',
  props: ['coll', 'colls'],
  data () {
    return {
    }
  },
  computed: {
    collNowIndex () {
      return this.colls.findIndex(c => c.id === this.coll)
    }
  },
  watch: {
    coll: {
      immediate: true,
      handler (to, from) {
        this.$log('coll CHANGED', to)
        if (to && from) {
          let toIndex = this.colls.findIndex(c => c.id === to)
          let fromIndex = this.colls.findIndex(c => c.id === from)
          if (toIndex >= 0 && fromIndex >= 0) {
            this.$log('toIndex / fromIndex', toIndex, fromIndex)
            if (toIndex > fromIndex) this.$log('GO RIGHT')
            else this.$log('GO LEFT')
          }
        }
        // deside go left or go right
        let toIndex = this
      }
    }
  },
  methods: {
    handleSwipe (e) {
      this.$log('handleSwipe', e)
    },
    handlePan (e) {
      this.$log('handlePan', e)
      this.$refs.scrollWrapper.scrollLeft -= e.delta.x
      if (e.isFinal) {
        this.$log('PAN FINAL')
      }
      if (e.isFirst) {
        this.$log('PAN FIRST')
      }
    },
    goLeft () {
      this.$log('goLeft')
    },
    goRight () {
      this.$log('goRight')
    },
    onScroll (e) {
      this.$log('onScroll', e)
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
