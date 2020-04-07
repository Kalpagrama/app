<template lang="pug">
q-layout(
  view="hHh lpR fFf" container
  :style=`{height: $q.screen.height+'px'}`)
  q-header(reveal).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px',
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-7
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        div(@click="essenceClick()").row.fit.items-center.content-center.justify-center
          span.text-white.text-bold Как прыгать котиком?
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="more_vert")
  //- fixed bottom menu
  div(:style=`{
    position: 'fixed', zIndex: 1000, bottom: '6px', left: '50%', transform: 'translate(-50%, 0%)',
    width: '80%', height: '50px', borderRadius: '25px', maxWidth: '200px'}`).row.bg-white
  q-page-conainter
    q-page
      //- kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      //-   template(v-slot:items=`{items}`)
      //-     node-list(:nodes="items")
      //- div(:style=`{height: $q.screen.height+'px'}`).column.full-width.bg-grey-10
        //- div(:style=`{height: '60px'}`).row.full-width
        //- div(
        //-   ref="itemsScroll" @scroll="onScroll"
        //-   ).col.full-width.scroll.q-py-xs
        //-   div(:style=`{marginTop: 65+'px', marginBottom: $q.screen.height/2+'px'}`).row.full-width.justify-center
        //-     div(:style=`{maxWidth: '100%'}`).row.full-width.br
              //- grid-layout(
              //-   :layout.sync="layout"
              //-   :colNum="8"
              //-   :rowHeight="1"
              //-   :isDraggable="false"
              //-   :isResizable="false"
              //-   :isMirrored="false"
              //-   :autoSize="true"
              //-   :preventCollision="true"
              //-   :verticalCompact="true"
              //-   :margin="[0, 0]"
              //-   :use-css-transforms="true"
              //-   ).full-width
              //-   grid-item(
              //-     v-for="(item, ii) in layout" :ref="`item-${item.i}`"
              //-     :x="item.x"
              //-     :y="item.y"
              //-     :w="item.w"
              //-     :h="item.h"
              //-     :i="item.i"
              //-     :key="item.i"
              //-     :isDraggable="false"
              //-     :isResizable="false"
              //-     )
              //-     item(
              //-       :item="item" :index="ii"
              //-       :opened="itemOpened === ii" @open="itemOpenHandle(item, ii)"
              //-       @update="layout = JSON.parse(JSON.stringify(layout))")
      div(:style=`{height: $q.screen.height+'px'}`).column.full-width.bg-grey-10.br
        div(:style=`{overflow: overflow}`).col.full-width.scroll.q-pa-sm
          masonry(:cols="4" :gutter="10")
            div(
              v-for="(i, ii) in images" :key="ii"
              :style=`{
                position: 'relative',
                marginTop: imgActive ? ii > imgActive && ii < imgActive + 4 ? '500px' : '0px' : '0px'
              }`
              ).row.full-width.q-py-xs
              img(
                @click="imgClick(i, ii)"
                :src="i.urls.regular"
                :style=`{width: '100%', borderRadius: '10px', overflow: 'hidden'}`)
</template>

<script>
import axios from 'axios'
const UNSPLASH_ACCESS_KEY = 'uI2AymszzNmMOoiYyNh8H1fI6EQeSfLBNy0qhQAJkOA'
import VueGridLayout from 'vue-grid-layout'
import item from './item'

export default {
  name: 'pageAppHome',
  components: {
    item,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  props: [],
  data () {
    return {
      // layout: [
      //   {i: '1', x: 1, y: 0, w: 1, h: 100},
      //   {i: '2', x: 2, y: 0, w: 1, h: 100},
      //   {i: '3', x: 1, y: 1, w: 1, h: 300},
      //   {i: '4', x: 2, y: 1, w: 1, h: 150}
      // ],
      layout: [],
      images: [],
      itemOpened: -1,
      itemsOpened: [],
      scrollTop: 0,
      overflow: 'auto',
      maxHeight: 500
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e, this.$refs.itemsScroll.scrollTop)
      this.maxHeight -= Math.abs(this.$refs.itemsScroll.scrollTop - this.scrollTop)
      this.scrollTop = this.$refs.itemsScroll.scrollTop
    },
    itemOpenHandle (i, ii) {
      this.$log('itemOpenHandle')
      this.maxHeight = 500
      this.itemsOpened.push(ii)
      if (this.itemOpened === ii) {
        this.itemOpened = -1
      }
      else {
        this.itemOpened = ii
      }
      this.$wait(200).then(() => {
        // this.$log('i.y', i.y)
        // this.$log('layout[ii].y', this.layout[ii].y)
        this.$tween.to(this.$refs.itemsScroll, 0.35, {scrollTop: this.layout[ii].y - 6})
      })
    },
    essenceClick () {
      this.$log('essenceClick')
      // this.itemOpened = -1
      let ref = this.$refs.itemsScroll
      let scrollTopFrom = ref.scrollTop
      let delay = 0.5 * (scrollTopFrom / 1000)
      this.$tween.to(this.$refs.itemsScroll, delay, {scrollTop: 0})
    },
    getLayout (arr) {
      return arr.reduce((acc, val, ii) => {
        // let x = (ii + 1) % 2 === 0 ? 0 : 1
        let x = acc[ii - 1] ? acc[ii - 1].x + 1 < 9 ? acc[ii - 1].x : 0 : 0
        acc.push({
          i: val.id + Date.now(),
          w: 1,
          h: 200,
          x: x,
          y: Math.round(ii / 2),
          thumbUrl: val.urls.regular,
          name: val.description
        })
        return acc
      }, [])
    },
    async searchUnsplash (topic = 'Cats') {
      try {
        this.$log('searchUnsplash start')
        let res = await axios.get(
          `https://api.unsplash.com/search/photos?query=${topic}&per_page=100`,
          {
            headers: {
              Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
              'Accept-Version': 'v1'
            }
          }
          )
        this.$log('searchUnsplash done', res.data.results)
        this.images = res.data.results
        // this.layout = this.getLayout(res.data.results)
        // setInterval(() => {
        //   this.$q.notify('ADD NEW')
        //   this.overfow = 'hidden'
        //   // this.layout = [...this.getLayout(res.data.results), ...this.layout]
        //   this.images = [...res.data.results.reverse(), ...this.images]
        //   this.$wait(500).then(() => {
        //     this.overfow = 'auto'
        //   })
        // }, 5000)
      }
      catch (e) {
        this.$log('searchUnsplash error', e)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.searchUnsplash()
    // TODO document set body color
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
