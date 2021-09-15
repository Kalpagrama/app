<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: 100,
  }`).row.full-width.items-start.content-start
  //- q-resize-observer(@resize="width = $event.width")
  //- first item
  div(:style=`{position: 'relative'}`).row.fit
    slot(name="item" :item="items[0]" :isActive="first" :itemIndex="0" :itemNexting="true" :next="next" :prev="prev"
      :itemIsFirst="true" :itemIsLast="false"
      :started="itemStarted" :ended="itemEnded")
  //- second item
  div(
    v-if="items[1]"
    :style=`{
      position: 'absolute', zIndex: 1000, right: 0,
      clipPath: 'inset(0px 0px 0px '+left+'px)',
    }`).row.fit
    slot(name="item" :item="items[1]" :isActive="!first" :itemIndex="1" :itemNexting="true" :next="next" :prev="prev"
      :itemIsFirst="false" :itemIsLast="false"
      :started="itemStarted" :ended="itemEnded")
  //- resizer wrapper
  div(
    v-if="items[1]"
    :style=`{
      position: 'absolute', zIndex: 2000,
      left: left+'px',
    }`
    ).row.full-height.bg-green.cursor-pointer
    //- resizer bar width
    div(
      :style=`{
        position: 'absolute', zIndex: 2000,
        left: -resizerBarWidth/2+'px',
        width: resizerBarWidth+'px',
        borderRadius: resizerBarWidth/2+'px',
        overflow: 'hidden'
      }`
      ).row.full-height.bg-green
    //- resizer bar
    div(
      v-touch-pan.left.right.prevent.mouse="resizerPan"
      @mouseenter="resizerBarOver = true"
      @mouseleave="resizerBarOver = false"
      :style=`{position: 'absolute', zIndex: 2001, left: '-30px', width: '60px'}`).row.full-height
    //- resizer btn
    q-btn(
      round flat color="white" icon="drag_indicator"
      :style=`{
        position: 'absolute', zIndex: 2002,
        top: 'calc(50% - 20px)',
        left: '-20px',
        borderRadius: '50%',
        pointerEvents: 'none',
      }`)
</template>

<script>
export default {
  name: 'listHorizontal',
  props: {
    items: {type: Array, default () { return [] }},
  },
  data () {
    return {
      width: 0,
      left: 0,
      resizerPanning: false,
      resizerBarWidth: 4,
      resizerBarOver: false,
    }
  },
  computed: {
    first () {
      return this.left > (this.width / 2)
    },
  },
  watch: {
    resizerBarOver: {
      handler (to, from) {
        this.$log('resizerBarOver TO', to)
        if (to) this.$gsap.to(this, 0.2, {resizerBarWidth: 20})
        else {
          if (this.resizerPanning) {
          }
          else {
            this.$gsap.to(this, 0.2, {resizerBarWidth: 4})
          }
        }
      }
    }
  },
  methods: {
    resizerClick (e) {
      this.$log('resizerClick', e)
    },
    resizerPan (e) {
      // this.$log('resizerPan', e)
      if (e.isFirst) {
        this.resizerPanning = true
      }
      if (e.isFinal) {
        this.resizerPanning = false
        this.resizerBarOver = false
      }
      let to = this.left + e.delta.x
      if (to >= this.resizerBarWidth / 2 && to <= this.width - this.resizerBarWidth / 2) {
        this.left = to
      }
    },
    next () {
      this.$log('next')
    },
    prev () {
      this.$log('prev')
    },
    itemStarted (i) {
      this.$log('itemStarted', i)
    },
    itemEnded (i) {
      this.$log('itemEnded')
    }
  },
  mounted () {
    if (this.items[1]) {
      this.left = this.width - 70
    }
    else {
      this.left = this.width
    }
  }
}
</script>
