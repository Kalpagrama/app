<template lang="pug">
div(
  :class=`{
    'full-height': loaded,
  }`
  :style=`{position: 'relative'}`
  ).row.fit.q-pb-sm.q-pl-xs.q-pr-xs
  div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-8
    //- {{item.x}}/{{item.y}}/{{item.w}}/{{item.h}}
    span(
      :style=`{position: 'absolute', zIndex: 200, bottom: '20px', left: '10px', borderRadius: '10px'}`
      ).text-white.q-pa-xs {{ itemName | cut(opened ? 240 : 30) }}
    div(
      v-if="opened"
      :style=`{height: '50px'}`).row.full-width.bg-red
    img(
      ref="itemThumburl"
      :src="item.thumbUrl" draggable="false" @click="imgClick"
      :style=`{
        width: '100%', height: loaded ? 'calc(100%)' : 'auto', objectFit: loaded ? 'cover' : 'contain',
        borderRadius: '10px', overflow: 'hidden'
      }`
      @load="imgLoaded")
  //- div(:style=`{height: '10px'}`).row.full-width
</template>

<script>
export default {
  name: 'item',
  props: ['item'],
  data () {
    return {
      loaded: false,
      opened: false,
      itemOld: null
    }
  },
  computed: {
    itemName () {
      return this.item.name || ''
    }
  },
  methods: {
    middleHandler (isVisible, entry) {
      this.$log('middleHandler', this.item.i)
    },
    async imgClick () {
      this.$log('imgClick')
      if (this.opened) {
        this.opened = false
        for (const k in this.itemOld) {
          this.$set(this.item, k, this.itemOld[k])
        }
      }
      else {
        this.opened = true
        if (this.item.x === 1) {
          this.$set(this.item, 'x', 0)
          // this.$set(this.item, 'y', this.item.y + 1)
        }
        // await this.$wait(300)
        this.$set(this.item, 'w', 2)
        this.$set(this.item, 'h', 500)
      }
      this.$emit('update')
    },
    imgLoaded () {
      // this.$log('imgLoaded')
      this.loaded = true
      let ref = this.$refs.itemThumburl
      this.$set(this.item, 'h', ref.clientHeight + 10)
      this.$emit('update')
      this.itemOld = JSON.parse(JSON.stringify(this.item))
    }
  }
}
</script>
