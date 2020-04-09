<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.bg-grey-10
  //- tint
  //- @click="itemClick(null, null)"
  div(
    v-if="itemsOpened.length > 0"
    :style=`{
      position: 'fixed', zIndex: 200, background: 'rgba(0,0,0,0.65)',
      pointerEvents: 'none'
    }`
    ).row.fit
  //- items opened
  div(
    v-for="(i, ii) in itemsOpened" :key="i.oid"
    :style=`{
      position: 'fixed',
      zIndex: 2000,
      left: i.left ? i.left+'px' : i.leftFrom+'px',
      top: i.top ? i.top-0+'px' : i.topFrom-0+'px',
      width: i.width ? i.width+'px' : i.widthFrom+'px',
      height: i.height ? i.height+'px' : i.heightFrom+'px',
      borderRadius: '10px', overflow: 'hidden',
      border: 'none'
    }`
    ).bg-grey-4
    div(
      :style=`{
        position: 'relative',
        borderRadius: '10px'
      }`
      ).column.fit.items-start.content-start
      span(
        :style=`{position: 'absolute', zIndex: 100, top: '10px', left: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
        ).q-pa-sm.text-white layer name {{i.left}}/{{i.top}}/{{i.width}}/{{i.height}}
      //- .col.full-height
      //- .row.full-width
      img(
        :src="i.item.thumbUrl"
        draggable="false"
        :style=`{
          objectFit: 'contain',
          borderRadius: '10px', overflow: 'hidden',
          maxHeight: 'calc(100% - 60px)',
          background: 'rgba(0,0,0,0.3)'
        }`).full-width
      //- div(:style=`{position: 'absolute'}`).bg
      div(
        v-if="i.opened"
        :style=`{height: '60px'}`).row.full-width.items-center.content-center
        //- div(:style=`{height: '60px'}`).row.full-width.br
        //-   span.text-bold Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          div(:style=`{height: '40px', width: '40px', borderRadius: '50%'}`).row.bg-grey-5
        .col.full-height
          .row.fit.items-center.content-center.justify-start
            span.text-bold Ivan Motovilov
            small.full-width @ivanmoto
        .col.full-height
          .row.fit.items-center.content-center
            .col
            div(:style=`{height: '60px'}`).row.items-center.content-center.q-px-md
              q-btn(
                v-if="true"
                round flat no-caps color="green"
                :style=`{borderRadius: '50%'}`).q-mr-sm
                q-icon(name="emoji_people" color="green" size="30px")
              span(
                v-if="false"
                :style=`{fontSize: '24px'}`).q-mr-lg 9.4
              span(:style=`{fontSize: '36px'}`).text-bold 4.6
        //- span.text-black.text-bold Something
  //- header
  //- div(:style=`{height: '60px'}`).row.full-width.bg-red
  //- body items
  div(
    ref="scrollWrapper"
    @scroll="onScroll"
    :class=`{}`
    :style=`{
      overflow: overflow
    }`
    ).col.full-width.scroll
    .row.full-width.justify-center
      masonry(
        :cols="{default: 7, 1800: 6, 1500: 5, 1200: 4, 900: 3, 600: 2}"
        :gutter="{default: 10, 1200: 10, 900: 10, 600: 10}"
        :style=`{marginTop: '70px', marginBottom: '500px'}`).q-px-sm
        div(
          v-for="(i, ii) in items" :key="i.oid" :ref="`item-${i.oid}`"
          @mouseenter="itemEnter(i, ii)"
          @mouseleave="itemLeave(i, ii)"
          :class=`{}`
          :style=`{
            position: 'relative',
            opacity: itemsOpened.find(x => x.item.oid == i.oid) ? 0 : 1
          }`
          ).row.full-width.q-py-xs
          small(
            v-if="i.oid === itemOverOid"
            :style=`{position: 'absolute', top: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
            ).q-pa-sm.text-white Lorem ipsum
          img(
            @click="itemClick(i, ii)"
            draggable="false"
            :src="i.thumbUrl"
            :style=`{width: '100%', userSelect: 'none', borderRadius: '10px', overflow: 'hidden'}`
            ).bg-black.cursor-pointer
</template>

<script>
import axios from 'axios'
const UNSPLASH_ACCESS_KEY = 'uI2AymszzNmMOoiYyNh8H1fI6EQeSfLBNy0qhQAJkOA'

export default {
  name: 'listMasonry',
  data () {
    return {
      items: [],
      itemsOpened: [],
      itemOverOid: null,
      overflow: 'auto',
      scrollTop: 0,
      topDelta: 0
    }
  },
  methods: {
    itemEnter (i, ii) {
      this.$log('itemEnter')
      this.itemOverOid = i.oid
    },
    itemLeave () {
      this.$log('itemLeave')
      this.itemOverOid = null
    },
    async itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      // close first item
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
            if (i === null) {
              this.itemsOpened = []
            }
          }
        })
      }
      if (!i) {
        // this.itemsOpened = []
        return
      }
      let ref = this.$refs[`item-${i.oid}`][0]
      let {left, top, width, height} = ref.getBoundingClientRect()
      this.topDelta = 0
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
      this.$tween.to(this.itemsOpened[this.itemsOpened.length - 1], 0.8, {
        left: this.$q.screen.width > 750 ? (this.$q.screen.width - 750) / 2 : 8,
        top: 70,
        width: this.$q.screen.width > 750 ? 750 : this.$q.screen.width - 16,
        height: this.$q.screen.height - 300,
        onComplete: () => {
          // this.itemsOpened[this.itemsOpened.length - 1].opened = true
          this.$set(this.itemsOpened[this.itemsOpened.length - 1], 'opened', true)
        }
      })
    },
    async onScroll (e) {
      // this.$log('onScroll')
      this.topDelta += e.target.scrollTop - this.scrollTop
      this.scrollTop = e.target.scrollTop
      let scrollBottom = e.target.scrollHeight - (e.target.scrollTop + e.target.clientHeight)
      this.$log('scrollBottom', scrollBottom)
      if (scrollBottom < e.target.clientHeight / 2) {
        // this.overflow = 'hidden'
        this.items = [...this.items, ...await this.getItems()]
        // this.items.splice(10)
        // this.items = this.items.slice(10)
      }
    },
    async getItems () {
      try {
        this.$log('getItems start')
        // this.overflow = 'hidden'
        let res = await axios.get(
          'https://api.unsplash.com/search/photos?query=Tool&per_page=30',
          {
            headers: {
              Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
              'Accept-Version': 'v1'
            }
          }
        )
        this.$log('getItems done')
        // this.$wait(500).then(() => {
        //   this.overflow = 'auto'
        // })
        let items = res.data.results.map(i => {
          return {
            oid: i.id + Date.now(),
            thumbUrl: i.urls.regular,
            name: i.description || ''
          }
        })
        return items
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
    this.$wait(0).then(() => {
      this.itemClick(this.items[5], 5)
    })
  }
}
</script>
