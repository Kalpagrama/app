<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-center.bg-grey-5
    //- header
    div(:style=`{position: 'sticky', zIndex: 1000, top: headerTop+'px', height: '60px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: '500px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.justify-between.bg-white.q-px-sm
        slot(name="default")
        .col.full-height
          .row.fit.items-center.q-px-sm
            span.text-bold {{ name }}
        q-btn(round dense flat :color="muted ? 'grey-6' : 'accent'" :icon="muted ? 'volume_off' : 'volume_up'" @click="volumeToggle()")
        q-btn(round dense flat color="grey-6" icon="more_vert" @click="feedOptions()")
    //- body
    div(:style=`{maxWidth: '500px'}`).row.full-width.q-pt-sm
      q-resize-observer(@resize="onResize")
      div(v-for="(n, ni) in nodes" :key="n.oid").row.full-width
        node(
          :index="ni" :node="n" :lang="ni"
          :needFull="ni >= fullNodes[0] && ni <= fullNodes[1]"
          :active="activeNode ? activeNode[0] === ni : false"
          :class=`{
          'bg-grey-2': activeNode ? activeNode[0] !== ni : false,
          'bg-white': activeNode ? activeNode[0] === ni : false}`
          :style=`{zIndex: activeNode ? activeNode[0] === ni ? 200 : 10 : 10, borderRadius: '10px'}`
          :noActions="true" :noSpheres="true" :noTimestamp="true"
          :width="width" :muted="muted"
          v-observe-visibility=`{
            callback: nodeVisible,
            throttle: 300,
            intersection: {
              threshold: 0.98
            }
          }`).q-mb-md.shadow-10
      div(v-if="false" :style=`{height: '80px'}`).row.full-width.items-center.justify-center
        q-spinner(v-show="fetchingMore" :thickness="2" color="primary" size="50px")
</template>

<script>
  import node from 'components/node'
  import assert from 'assert'

  export default {
    name: 'nodeFeed',
    components: { node },
    props: ['name', 'nodes', 'fetchingMore'],
    data () {
      return {
        visibleNodes: [],
        width: 0,
        headerTop: 0,
        muted: true
      }
    },
    computed: {
      // массив из двух индексов from-to ядер, подлещащих обязательной загрузке
      fullNodes () {
        if (this.activeNode) {
          let indexCurrent = this.activeNode[0]
          let res = []
          if (indexCurrent < 3) res = [0, indexCurrent + 3]
          else res = [indexCurrent - 3, indexCurrent + 3]
          return res
        } else {
          return [0, 0]
        }
      },
      // массив из индексов ядер,которые выше либо ниже активного ядра
      ajacentNodes () {
        let result = []
        if (this.activeNode) {
          let pos = this.activeNode[0]
          while (result.length < 3 && pos > 0) result.push(--pos)
          pos = this.activeNode[0]
          while (result.length < 6 && pos > 0) result.push(--pos)

          let indexCurrent = this.activeNode[0]
          let res = []
          if (indexCurrent < 5) res = [0, indexCurrent + 5]
          else res = [indexCurrent - 5, indexCurrent + 5]
          return res
        } else {
          return result
        }
      },
      activeNode () {
        if (this.visibleNodes.length > 0) return this.visibleNodes[0]
        else return null
      }
    },
    watch: {
      // изменилось активное ядро
      activeNode: {
        async handler (to, from) {
          this.$logD('activeNode CHANGED', to)
          if (to && to !== from) {
            { // prefetch nodes. возможно эти ядра скоро понадобятся
              let activeNodeIndx = to[0]
              // this.$logD('activeNodeIndx', activeNodeIndx)
              assert.ok(activeNodeIndx >= 0 && this.nodes.length)
              let leftBorder = Math.max(0, activeNodeIndx - 4)
              let rightBorder = Math.min(this.nodes.length - 1, activeNodeIndx + 4)
              // this.$logD('leftBorder', leftBorder)
              // this.$logD('rightBorder', rightBorder)
              assert.ok(leftBorder <= rightBorder && leftBorder <= activeNodeIndx && rightBorder >= activeNodeIndx)
              // последние запрошенные - в приоритете. запрашиваем от краев к центру
              let next = 0
              while (next >= 0) {
                if (activeNodeIndx - leftBorder > rightBorder - activeNodeIndx) next = leftBorder++
                else if (activeNodeIndx - leftBorder < rightBorder - activeNodeIndx) next = rightBorder--
                else next = -1
                if (next >= 0) {
                  // this.$logD('next', next)
                  assert.ok(next >= 0 && next < this.nodes.length && next !== activeNodeIndx)
                  this.$emit('prefetch', this.nodes[next].oid)
                }
              }
            }
            if (this.nodes.length - to[0] < 4 && !this.fetchingMore) {
              this.$logD('MORE')
              this.$emit('more')
            }
          }
        }
      }
    },
    methods: {
      scrollDirectionChanged (b) {
        this.$logD('scrollDirectionChanged')
        this.$tween.to(this, 0.3, { headerTop: b ? -60 : 0 })
      },
      feedOptions () {
        this.$logD('feedOptions')
      },
      volumeToggle () {
        this.$logD('volumeToggle')
        this.$set(this, 'muted', !this.muted)
        // this.muted = !this.muted
      },
      onResize (e) {
        // this.$logD('onResize', e)
        this.width = e.width
      },
      async nodeVisible (isVisible, entry) {
        let top = entry.target.offsetTop
        let name = entry.target.title
        let index = parseInt(entry.target.lang)
        if (isVisible) {
          this.$logD('nodeVisible SHOW', index)
          this.visibleNodes.unshift([index, top])
        } else if (this.visibleNodes.find(([i, t]) => (i === index)) && this.visibleNodes.length > 1) {
          this.$logD('nodeVisible HIDE', index)
          this.visibleNodes = this.visibleNodes.filter(([i, t]) => (i !== index))
        }
      }
    },
    async mounted () {
      this.$logD('mounted')
    },
    beforeDestroy () {
      this.$logD('beforeDestroy')
    }
  }
</script>
