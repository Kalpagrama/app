<template lang="pug">
div(
  :style=`{position: 'relative'}`).row.full-width.justify-center
  q-resize-observer(@resize="e => width = e.width")
  //- debug
  //- stats
  //- .row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.br
      span.text-white scroll: {{scrollLeft}}/{{scrollWidth}}
      .row.full-width
        span.text-white itemActive: {{ itemActive }}
      .row.full-width
        span.text-white itemsCenter: {{itemsCenter}}
  //- items center debug
  //- div(
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: '50%', overflow: 'hidden',
      width: '2px',
    }`).row.full-height.bg-green
  //- wrapper
  div(
    ref="scrollWrapper"
    :class=`{
      'q-py-xl': width > 900,
      'q-py-md': width <= 900
    }`
    :style=`{
      position: 'relative',
      overflowY: 'hidden',
    }`
    @scroll="onScroll").row.full-width.scroll
    div(
      :style=`{
      }`
      ).row.full-width.no-wrap
      //- left padding
      div(
        :style=`{
          width: itemsPadding+'px',
          minWidth: itemsPadding+'px',
          height: itemSide+'px',
          minHeight: itemSide+'px',
        }`
        ).row
      //- items
      div(
        v-for="(i,ii) in itemsMeta" :key="ii"
        :style=`{
          width: itemSide+'px',
          minWidth: itemSide+'px',
          height: itemSide+'px',
          minHeight: itemSide+'px',
          transform: 'perspective(600px) rotateY('+18*itemPercent(i)+'deg)',
          position: 'relative'
        }`
        ).row
        //- item inactive tint
        div(
          v-if="itemActive !== ii"
          @click="itemGo(i, ii)"
          :style=`{
            position: 'absolute', zIndex: 1000,
          }`
          ).row.fit
        slot(name="item" :isActive="itemActive === ii" :item="i.item" :meta="i")
      //- right padding
      div(
        :style=`{
          width: itemsPadding+'px',
          minWidth: itemsPadding+'px',
          height: itemSide+'px',
          minHeight: itemSide+'px',
        }`
        ).row
</template>

<script>
export default {
  name: 'listSlider',
  props: {
    items: {type: Array, default () { return [] }},
  },
  data () {
    return {
      width: 0,
      scrollLeft: 0,
      scrollWidth: 0,
    }
  },
  computed: {
    itemsMeta () {
      return this.items.reduce((acc, item, i) => {
        // got item before...
        if (acc[i - 1]) {
          this.$log('item META', i, acc[i - 1].from)
          acc.push({
            from: acc[i - 1].to,
            to: acc[i - 1].to + this.itemSide,
            item: item,
          })
        }
        // first item!
        else {
          this.$log('first item !!!')
          acc.push({
            from: this.itemsPadding,
            to: this.itemsPadding + this.itemSide,
            item: item,
          })
        }
        return acc
      }, [])
    },
    itemSide () {
      if (this.width <= 900) {
        return this.width * 0.48
        // return this.width * 0.9
      }
      else {
        return 900 / 2
      }
    },
    itemActive () {
      return this.itemsMeta.findIndex(i => {
        return this.itemsCenter > i.from && this.itemsCenter < i.to
      })
    },
    itemsPadding () {
      return (this.width / 2) - (this.itemSide / 2)
    },
    itemsCenter () {
      return this.scrollLeft + (this.width / 2)
    },
  },
  methods: {
    itemGo (item, ii) {
      this.$log('itemGo', item, ii)
      let left = item.from - this.itemsPadding
      this.$tween.to(this.$refs.scrollWrapper, 0.5, {scrollLeft: left})
    },
    itemPercent (i) {
      let itemWidth = i.to - i.from
      let itemMiddle = i.from + (itemWidth / 2)
      let itemCenterAway = this.itemsCenter - itemMiddle
      return itemCenterAway / itemWidth
    },
    onScroll (e) {
      // this.$log('onScroll')
      this.scrollLeft = e.target.scrollLeft
      this.scrollWidth = e.target.scrollWidth
    },
    itemsScrollToCenter () {
      this.$log('itemsScrollToCenter',)
      let widthItems = this.items.length * this.itemSide
      let width = (widthItems / 2) - (this.itemSide / 2)
      this.$log('width', width)
      this.$tween.to(this.$refs.scrollWrapper, 0.5, {scrollLeft: width})
    }
  },
  mounted () {
    this.$log('mounted')
    this.itemsScrollToCenter()
  }
}
</script>
