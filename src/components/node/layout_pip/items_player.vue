<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).row.full-width.items-start.content-start
  //- preview
  img(:src="preview" draggable="false" :style=`{userSelect: 'none', objectFit: 'contain', opacity: 0}`).full-width
  //- item PREV call
  div(
    v-if="itemsG.prev" @click="itemsGPrevClick()"
    :style=`{
      position: 'absolute', zIndex: 1000, left: '0px', top: '0x',
      width: '20%', height: '100%',
      background: 'rgba(0,0,0,0.5)'
    }`
    ).row.cursor-pointer
  //- item PREV
  div(
    v-if="itemsG.prev && itemsGPrevShow"
    :style=`{
      position: 'absolute', zIndex: 400, right: '0px', bottom: '0px',
    }`
    ).row.full-width
    composition(
      :preview="itemsG.prev.thumbUrl"
      :value="itemsG.prev"
      :visible="true" :active="true" :mini="false")
  //- item NOW
  div(
    v-if="itemsG.now && true"
    :style=`{
      position: 'absolute', zIndex: 500, right: '0px', bottom: '0px',
      maxWidth: nowMaxWidth+'%',
      maxHeight: nowMaxHeight+'%'
    }`
    ).row.full-width.items-end.content-end
    //- debug
    div(v-if="false" :style=`{position: 'absolute', zIndex: 1100, bottom: '0px', left: '50%'}`).row.text-white.bg-purple
      small.full-width {{itemsG.now.oid}}
    //- composition
    composition(
      :preview="itemsG.now.thumbUrl"
      :value="itemsG.now"
      :visible="visible" :active="nowMaxWidth > 50" :mini="nowMaxWidth < 50"
      @height="$emit('meta', ['height', $event])")
  //- item NEXT
  div(
    v-if="itemsG.next && true"
    :style=`{
      position: 'absolute', zIndex: 2000, right: '0px', bottom: '0px',
      maxWidth: nextMaxWidth+'%',
      maxHeight: nextMaxHeight+'%',
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).row.full-width.items-start.content-start.br
    //- debug
    div(v-if="false" :style=`{position: 'absolute', zIndex: 1100, bottom: '0px', left: '50%'}`).row.text-white.bg-purple
      small.full-width {{itemsG.next.oid}}
    //- tint
    div(
      v-if="nextMaxWidth < 30" @click="itemsGNextClick()"
      :style=`{position: 'absolute', zIndex: 10000}`).row.fit.cursor-pointer
    composition(
      :preview="itemsG.next.thumbUrl"
      :value="itemsG.next"
      :visible="true" :active="nextMaxWidth > 50" :mini="nextMaxWidth < 50")
</template>

<script>
export default {
  name: 'nodeLayoutPip-itemsPlayer',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened', 'nodeLoad'],
  data () {
    return {
      itemIndex: 0,
      nowMaxWidth: 100,
      nowMaxHeight: 100,
      nextMaxWidth: 25,
      nextMaxHeight: 50,
      itemsGPrevShow: false
    }
  },
  computed: {
    preview () {
      return this.node.meta.items[0].thumbUrl
    },
    itemsRaw () {
      if (this.nodeFull) {
        return this.nodeFull.items
      }
      else {
        return this.node.meta.items
      }
    },
    items () {
      return [...this.itemsRaw, ...this.itemsRaw, ...this.itemsRaw]
    },
    itemsG () {
      let g = {
        prev: null,
        now: null,
        next: null
      }
      // add prev
      if (this.itemIndex > 0) {
        g.prev = this.items[this.itemIndex - 1]
      }
      // add now
      if (this.items[this.itemIndex]) {
        g.now = this.items[this.itemIndex]
      }
      // add next
      if (this.items[this.itemIndex + 1]) {
        g.next = this.items[this.itemIndex + 1]
      }
      return g
    }
  },
  methods: {
    itemsGPrevClick () {
      this.$log('itemsGPrevClick start')
      this.itemsGPrevShow = true
      this.$tween.to(
        this,
        0.5,
        {
          nowMaxWidth: 25,
          nowMaxHeight: 50,
          nextMaxWidth: 0,
          nextMaxHeight: 0,
          onComplete: () => {
            this.$log('itemsGPrevClick done')
            this.itemIndex -= 1
            this.nowMaxWidth = 100
            this.nowMaxHeight = 100
            this.nextMaxWidth = 25
            this.nextMaxHeight = 50
            this.itemsGPrevShow = false
          }
        }
      )
    },
    itemsGNextClick () {
      this.$log('itemsGNextClick start')
      let itemIndexTo = this.itemIndex + 1
      if (this.items[this.itemIndexTo]) return
      this.$tween.to(
        this,
        0.5,
        {
          nextMaxWidth: 100,
          nextMaxHeight: 100,
          onComplete: () => {
            this.$log('itemsGNextClick done')
            this.itemIndex += 1
            this.nextMaxWidth = 25
            this.nextMaxHeight = 50
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
