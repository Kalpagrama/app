<style lang="sass" scoped>
.item-prev
  opacity: 0
  &:hover
    opacity: 1
    background: rgba(255,255,255,0.2) !important
.item-next
  cursor: pointer
  border-radius: 10px
  &:hover
    background: rgba(255,255,255,0.1) !important
.item-again
  &:hover
    background: rgba(255,255,255,0.2) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 100,
  }`
  ).row.fit.items-start.content-start
  //- item prev
  q-btn(
    v-if="prevBtnShow && itemIndex !== 0 && items.length > 1"
    @click="prev()"
    round flat
    color="white"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: '0px', top: '60px',
      width: '15%',
      height: 'calc(100% - 120px)',
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0)',
    }`)
    q-icon(
      name="keyboard_arrow_left" color="white" size="40px"
      :style=`{opacity: 0.8}`)
  //- items wrapper
  div(
    v-for="(i,ii) in items" :key="ii"
    v-if="ii >= itemIndex && ii <= itemIndex+1"
    :style=`{
      position: 'absolute', zIndex: 100+ii, right: '0px', bottom: '-0.5px',
      maxWidth: itemIndex === ii ? nowMaxWidth+'%' : nextMaxWidth+'%',
      maxHeight: itemIndex === ii ? nowMaxHeight+'%' : nextMaxHeight+'%',
      opacity: itemIndex === ii ? 1 : (nextMaxWidth / 100) + 0.3,
      transform: 'translate3d(0,0,0)',
    }`).row.fit.items-end.content-end
    //- slot with props and events
    slot(
      name="item"
      :item="i"
      :itemIsFirst="ii === 0"
      :itemIsLast="ii === items.length-1"
      :itemIndex="ii"
      :itemNexting="itemNexting === ii"
      :itemActive="itemIndex === ii"
      :next="next"
      :prev="prev"
      :started="itemStarted"
      :ended="itemEnded")
</template>

<script>
export default {
  name: 'listPip',
  // props: ['items', 'itemPrevShow'],
  props: {
    items: {type: Array, default () { return [] }},
    prevBtnShow: {type: Boolean, default () { return true }},
  },
  data () {
    return {
      itemIndex: 0,
      itemNexting: null,
      // now
      nowMaxWidth: 100,
      nowMaxHeight: 100,
      // next
      nextMaxWidth: 25,
      nextMaxHeight: 25,
    }
  },
  methods: {
    prev () {
      this.$log('prev')
      this.itemIndex -= 1
    },
    next () {
      this.$log('next')
      let i = this.itemIndex + 1
      this.$log('next', i)
      // check
      if (!this.items[i]) return
      // set itemNexting for full-height prop
      this.itemNexting = i
      // tween
      this.$tween.to(
        this,
        0.5,
        {
          nextMaxWidth: 100,
          nextMaxHeight: 100,
          onComplete: () => {
            this.itemIndex = i
            this.itemNexting = null
            this.nextMaxWidth = 25
            this.nextMaxHeight = 25
          }
        }
      )
    },
    itemStarted (i) {
      this.$log('itemStarted', i)
    },
    itemEnded (i) {
      this.$log('itemEnded', i)
      if (this.items[i + 1]) this.next()
      else this.itemIndex = 0
    },
  }
}
</script>
