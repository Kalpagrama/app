<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.bg-grey-10
  //- items opened
  div(
    v-for="(i, ii) in itemsOpened" :key="i.oid"
    :style=`{
      position: 'fixed',
      zIndex: 2000,
      left: i.left ? i.left+'px' : i.leftFrom+'px',
      top: i.top ? i.top+'px' : i.topFrom+'px',
      width: i.width ? i.width+'px' : i.widthFrom+'px',
      height: i.height ? i.height+'px' : i.heightFrom+'px',
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).column.bg-grey-9
    div(
      :style=`{
        position: 'relative',
        borderRadius: '10px'
      }`
      ).row.fit
      span(
        :style=`{position: 'absolute', zIndex: 100, top: '10px', left: '10px'}`
      ).text-white {{i.left}}/{{i.top}}/{{i.width}}/{{i.height}}
      img(
        :src="i.item.thumbUrl"
        draggable="false"
        :style=`{
          objectFit: 'contain',
          borderRadius: '10px', overflow: 'hidden'
        }`).fit.bg-black
      div(
        v-if="i.opened"
        :style=`{height: '60px'}`).row.full-width.bg-red
        span.text-white hello
  //- header
  div(:style=`{height: '60px'}`).row.full-width.bg-red
  //- body items
  div(
    ref="scrollWrapper"
    @scroll="onScroll"
    :class=`{}`
    :style=`{}`
    ).col.full-width.scroll
    masonry(
      :cols="4" :gutter="50"
      :style=`{marginTop: '500px', marginBottom: '500px'}`).q-px-sm
      div(
        v-for="(i, ii) in items" :key="i.oid" :ref="`item-${i.oid}`"
        :class=`{}`
        :style=`{
          position: 'relative',
          opacity: itemsOpened.find(x => x.item.oid == i.oid) ? 0 : 1
        }`
        ).row.full-width.q-py-xs
        img(
          @click="itemClick(i, ii)"
          draggable="false"
          :src="i.thumbUrl"
          :style=`{width: '100%', userSelect: 'none', borderRadius: '10px', overflow: 'hidden'}`).bg-black
</template>

<script>
import axios from 'axios'
const UNSPLASH_ACCESS_KEY = 'uI2AymszzNmMOoiYyNh8H1fI6EQeSfLBNy0qhQAJkOA'

export default {
  name: 'listMasonry',
  data () {
    return {
      items: [],
      itemsOpened: []
    }
  },
  methods: {
    async itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      let ref = this.$refs[`item-${i.oid}`][0]
      let {left, top, width, height} = ref.getBoundingClientRect()
      let itemFrom = this.itemsOpened[0]
      if (itemFrom) {
        // close first item
        let refFrom = this.$refs[`item-${itemFrom.item.oid}`][0]
        let {left, top, width, height} = refFrom.getBoundingClientRect()
        this.$tween.to(this.itemsOpened[0], 0.6, {
          left: left,
          top: top,
          width: width,
          height: height,
          opened: false,
          onComplete: () => {
            this.itemsOpened.shift()
          }
        })
      }
      this.itemsOpened.push({
        item: i,
        index: ii,
        left: left,
        leftFrom: left,
        top: top,
        topFrom: top,
        width: width,
        widthFrom: width,
        height: height,
        heightFrom: height,
        opened: false
      })
      // open last item
      // if (this.scrollWrapperWidth) this.scrollWrapperWidth = this.$refs.scrollWrapper.clientWidth
      // await this.$wait(200)
      this.$tween.to(this.itemsOpened[this.itemsOpened.length - 1], 0.8, {
        left: (this.$q.screen.width - 750) / 2,
        top: 120,
        width: 750,
        height: 500,
        onComplete: () => {
          // this.itemsOpened[this.itemsOpened.length - 1].opened = true
          this.$set(this.itemsOpened[this.itemsOpened.length - 1], 'opened', true)
        }
      })
    },
    onScroll (e) {
      this.$log('onScroll', e)
    },
    async getItems () {
      try {
        this.$log('getItems start')
        let res = await axios.get(
          'https://api.unsplash.com/search/photos?query=Cars&per_page=30',
          {
            headers: {
              Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
              'Accept-Version': 'v1'
            }
          }
        )
        this.$log('getItems done')
        return res.data.results.map(i => {
          return {
            oid: i.id,
            thumbUrl: i.urls.regular,
            name: i.description || ''
          }
        })
      }
      catch (e) {
        this.$log('getItems error', e)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.items = await this.getItems()
    window.onkeydown = (e) => {
      if (e.keyCode === 32) {
        e.preventDefault()
        let i = this.itemsOpened[this.itemsOpened.length - 1].index + 1
        if (!this.items[i]) i = 0
        this.itemClick(this.items[i], i)
      }
    }
  }
}
</script>
