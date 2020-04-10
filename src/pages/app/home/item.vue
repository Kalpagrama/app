<template lang="pug">
div(
  :class=`{
    'full-height': loaded,
  }`
  :style=`{position: 'relative'}`
  ).row.fit.items-start.content-start.q-pl-xs.q-pr-xs
  div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', height: 'calc(100% - 10px)'}`).row.full-width.items-start.content-start.bg-grey-9
    //- {{item.x}}/{{item.y}}/{{item.w}}/{{item.h}}
    //- span(
    //-   :style=`{position: 'absolute', zIndex: 200, bottom: '20px', left: '10px', borderRadius: '10px'}`
    //-   ).text-white.q-pa-xs {{ itemName | cut(opened ? 240 : 20) }}
    //- header with author
    div(
      v-if="opened"
      :style=`{height: '40px'}`).row.full-width.items-center.content-center
      div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
        div(:style=`{height: '30px', width: '30px', borderRadius: '50%'}`).row.bg-grey-3
      .col.full-width
        .row.fit.items-center.content-center
          small.text-white.text-bold Ivan Motovilov
          small.text-white.full-width @ivanmoto
      div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="more_horiz")
    img(
      ref="itemThumburl"
      :src="item.thumbUrl" draggable="false" @click="imgClick"
      :style=`{
        width: '100%',
        height: loaded ? opened ? 'calc(100% - 80px)' : 'calc(100% - 40px)' : 'auto',
        objectFit: loaded ? 'contain' : 'contain',
        borderRadius: '10px', overflow: 'hidden'
      }`
      @load="imgLoaded").bg-black.cursor-pointer
    //- footer
    div(:style=`{height: '40px'}`).row.full-width.items-center.content-center
      div(
        v-if="opened"
        :style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
        div(:style=`{height: '26px', width: '26px',  borderRadius: '50%'}`).row.bg-grey-3
      .col.full-height
        .row.fit.item-center.content-center.q-px-sm
          span.text-white {{ itemName | cut(opened ? 240 : 20) }}
          //- span.text-white.text-bold {{ item.y }}/{{ item.h }}
</template>

<script>
export default {
  name: 'item',
  props: ['item', 'index', 'opened'],
  data () {
    return {
      loaded: false,
      // opened: false,
      itemOld: null
    }
  },
  computed: {
    itemName () {
      return this.item.name || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry'
    }
  },
  watch: {
    opened: {
      handler (to, from) {
        this.$log('opened CHANGED', to)
        let offsetTop = this.$parent.$el.offsetTop
        this.$log('offsetTop', offsetTop)
        if (to) {
          if (this.item.x === 1) {
            this.$set(this.item, 'x', 0)
            // this.$set(this.item, 'y', this.item.y + 1)
          }
          this.$set(this.item, 'w', 2)
          // this.$set(this.item, 'h', 500)
          this.$set(this.item, 'h', this.$q.screen.height - 80)
        }
        else {
          for (const k in this.itemOld) {
            this.$set(this.item, k, this.itemOld[k])
          }
        }
        this.$emit('update')
      }
    }
  },
  methods: {
    middleHandler (isVisible, entry) {
      this.$log('middleHandler', this.item.i)
    },
    async imgClick () {
      this.$log('imgClick')
      this.$emit('open')
      this.$emit('update')
    },
    imgLoaded () {
      // this.$log('imgLoaded')
      this.loaded = true
      let ref = this.$refs.itemThumburl
      this.$set(this.item, 'h', ref.clientHeight + 40 + 10)
      this.$emit('update')
      this.itemOld = JSON.parse(JSON.stringify(this.item))
    }
  },
  mounted () {
    // this.$log('mounted')
  }
}
</script>
