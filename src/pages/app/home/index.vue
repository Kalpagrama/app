<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-header(reveal)
    div(:style=`{height: '70px'}`).row.full-width.bg-grey-4
      span.text-white.text-bold Как прыгать котиком?
  q-page-conainter.row.fit.justify-center.items-start.content-start.bg-grey-9
    //- kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
    //-   template(v-slot:items=`{items}`)
    //-     node-list(:nodes="items")
    div(:style=`{height: $q.screen.height+'px'}`).column.full-width
      .col.full-width.scroll.q-py-xs
        .row.full-width.justify-center
          div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
            grid-layout(
              :layout.sync="layout"
              :colNum="2"
              :rowHeight="1"
              :isDraggable="false"
              :isResizable="false"
              :isMirrored="false"
              :autoSize="true"
              :preventCollision="true"
              :verticalCompact="true"
              :margin="[0, 0]"
              :use-css-transforms="true"
              :style=`{width: 'calc(100%)'}`
              )
              grid-item(
                v-for="(item, ii) in layout"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :key="item.i"
                :isDraggable="false"
                :isResizable="false")
                item(:item="item" @update="layout = JSON.parse(JSON.stringify(layout))")
    //- div(:style=`{height: $q.screen.height+'px'}`).column.full-width.bg-grey-10.br
    //-   .col.full-width.scroll.q-pa-sm
    //-     masonry(:cols="4" :gutter="10")
    //-       div(
    //-         v-for="(i, ii) in images" :key="ii"
    //-         :style=`{
    //-           position: 'relative',
    //-           marginTop: imgActive ? ii > imgActive && ii < imgActive + 4 ? '500px' : '0px' : '0px'
    //-         }`
    //-         ).row.full-width.q-py-xs
    //-         img(
    //-           @click="imgClick(i, ii)"
    //-           :src="i.urls.regular"
    //-           :style=`{width: '100%', borderRadius: '10px', overflow: 'hidden'}`)
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
      imgActive: null
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
    itemAdd (item, ii) {
      this.$log('itemAdd', item, ii)
      // this.$set(this.layout, )
      this.layout.splice(ii, 0, item)
      // this.$set(this, 'layout', layoutNew)
    },
    imgClick (i, ii) {
      this.$log('imgClick', i, ii)
      this.imgActive = ii
    },
    getLayout (arr) {
      return arr.reduce((acc, val, ii) => {
        let x = (ii + 1) % 2 === 0 ? 0 : 1
        acc.push({
          i: val.id,
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
        this.layout = this.getLayout(res.data.results)
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
