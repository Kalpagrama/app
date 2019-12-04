<template lang="pug">
div(
  ).column.full-width
  //- tabs
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="tabs" ref="kCollsTabsWrapper"
      :style=`{position: 'relative', height: '50px'}`).row.full-width.no-wrap.scroll.q-px-sm.bg-grey-3
      div(
        v-ripple="{color: 'white'}"
        :style=`{
          position: 'absolute', bottom: '10px', zIndex: 200, height: '30px',
          borderRadius: '10px', overflow: 'hidden', backdropFilter: 'invert(100%)',
          width: collScroll.width+'px', left: 8+collScroll.left+'px'}`).row.cursor-pointer
      div(
        v-for="(c, ci) in getColls" :key="c.id" @click="$emit('coll', c.id)"
        :style=`{position: 'relative', height: '50px', minWidth: c.width+'px', maxWidth: c.width+'px', width: c.width+'px'}`
        )
        div(:style=`{position: 'relative', overflow: 'hidden'}`).row.fit.items-center.justify-center
          span(:style=`{whiteSpace: 'nowrap'}`).text-bold.cursor-pointer {{c.name}}
  //- body
  div(v-touch-pan.left.right.prevent.mouse="handlePan").col.full-width
    div(
      ref="kCollsScrollWrapper" @scroll="handleScroll"
      :style=`{position: 'relative', overflowX: overflow}`).row.fit.no-wrap.scroll.kscroll
      div(
        v-for="(c, ci) in colls" :key="c.id"
        :style=`{width: '100%', minWidth: '100%', maxWidth: '100%'}`
        ).row.full-height.items-start.content-start
        slot(:name="c.id")
</template>

<script>
// TODO: get coll width from clientWidth, not from name.length
// TODO: travel through another colls?
// TODO: change position absolte left to transform for better perfomance?
// TODO: scroll tabs scroll to the center in live
// TODO: move to the center of screen active tab...

export default {
  name: 'kColls',
  props: ['coll', 'colls', 'disable', 'header', 'tabs', 'actions'],
  data () {
    return {
      debug: false,
      controls: false,
      overflow: 'hidden',
      panning: false,
      firstMove: true,
      collIndex: 0,
      clientWidth: this.$q.screen.width,
      scrollLeft: 0,
      scrollWidth: 0,
      visited: []
    }
  },
  computed: {
    getColls () {
      return this.colls.map(c => {
        c.width = (c.name.length * 8.5) + 10
        return c
      })
    },
    collNowIndex () {
      return this.getColls.findIndex(c => c.id === this.coll)
    },
    collNowVisible () {
      // if (this.collScroll.left > )
      return false
    },
    collNow () {
      return this.getColls[this.collNowIndex]
    },
    collScroll () {
      let k = (this.scrollLeft - (this.clientWidth * this.collNowIndex)) / this.clientWidth
      let left = this.getColls.reduce((acc, val, i) => {
        if (i < this.collNowIndex) {
          acc += val.width
        }
        return acc
      }, 0)
      let leftDelta = this.collNowIndex > this.collToIndex ? this.collTo.width * k : this.collNow.width * k
      let width = 0
      if (this.collTo.width > this.collNow.width) {
        width = this.collNow.width + ((this.collTo.width - this.collNow.width) * Math.abs(k))
      } else {
        width = this.collNow.width - ((this.collNow.width - this.collTo.width) * Math.abs(k))
      }
      return {
        k: k,
        width: width,
        left: left + leftDelta
      }
    },
    collToIndex () {
      if (this.collNowIndex === 0) return 1
      let k = this.scrollLeft / this.clientWidth
      if (k > this.collNowIndex) return Math.ceil(k)
      else return Math.floor(k)
    },
    collTo () {
      return this.getColls[this.collToIndex]
    },
    tabsLeft () {
      return this.collScroll.left - (this.collScroll.width / 2)
    }
  },
  watch: {
    tabsLeft: {
      handler (to, from) {
        // this.$logD('tabsLeft', to)
        this.$refs.kCollsTabsWrapper.scrollLeft = to - (this.clientWidth / 3)
      }
    },
    coll: {
      immediate: true,
      async handler (to, from) {
        this.$logD('coll CHANGED', to)
        if (to) {
          this.$nextTick(() => {
            let i = this.colls.findIndex(c => c.id === to)
            if (i < 0) this.$emit('coll', this.colls[0].id)
            else {
              this.visited.push(to)
              this.move(i, this.firstMove)
              if (this.firstMove) this.firstMove = false
              this.collIndex = i
            }
          })
        }
      }
    }
  },
  methods: {
    handleScroll (e) {
      // this.$logD('handleScroll', e)
      this.clientWidth = e.target.clientWidth
      this.scrollLeft = e.target.scrollLeft
      this.scrollWidth = e.target.scrollWidth
      this.$emit('scroll', e)
    },
    async handleSwipe (e) {
      let i = e.direction === 'left' ? this.collIndex + 1 : this.collIndex - 1
      if (this.disable || i < 0 || i > this.colls.length - 1 || !this.colls[i]) return
      this.$logD('handleSwipe', e)
      this.$emit('coll', this.colls[i].id)
    },
    handlePan (e) {
      if (this.disable) return
      if (e.distance.x > this.clientWidth * 1.3) return
      // if (e.direction === 'right' && this.collNowIndex === 0) return
      // this.$q.notify(e.direction)
      // let d = this.$refs.kCollsTabsWrapper.scrollWidth / this.$refs.kCollsScrollWrapper.scrollWidth
      // this.$refs.kCollsTabsWrapper.scrollLeft -= e.delta.x * d
      this.$refs.kCollsScrollWrapper.scrollLeft -= e.delta.x
      if (e.isFirst) {
        this.panning = true
        this.overflow = 'auto'
        if (e.position.left < 60) return
      }
      if (e.isFinal) {
        // this.$logD('e.duration', e.duration)
        if (e.duration < 300) {
          this.panning = false
          this.handleSwipe(e)
        } else {
          setTimeout(() => {
            this.panning = false
          }, 500)
          this.oveflow = 'hidden'
          let i = Math.round(this.$refs.kCollsScrollWrapper.scrollLeft / this.$refs.kCollsScrollWrapper.clientWidth)
          // this.$logD('i', i)
          let coll = this.colls[i]
          if (coll.id === this.coll) {
            this.$logD('SAME SAME SAME')
            this.move(i, false, 0.1)
          } else {
            this.$logD('coll.id', coll.id)
            this.$emit('coll', coll.id)
          }
        }
      }
    },
    move (index, immediate, ms) {
      return new Promise((resolve, reject) => {
        // this.$logD('move start', index)
        let clientWidth = this.$refs.kCollsScrollWrapper.clientWidth
        let scrollLeft = clientWidth * index
        // this.$logD('scrollLeft', scrollLeft)
        this.overflow = 'auto'
        if (immediate) {
          this.$refs.kCollsScrollWrapper.scrollLeft = scrollLeft
          this.overflow = 'hidden'
          // this.$logD('move DONE')
        } else {
          this.$tween.to(
            this.$refs.kCollsScrollWrapper,
            ms || 0.15,
            {
              scrollLeft: scrollLeft,
              onComplete: () => {
                // this.$logD('move DONE')
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
