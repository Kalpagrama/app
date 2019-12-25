<template lang="pug">
div(:style=`{position: 'relative'}`)
  div(:style=`{position: 'relative', borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.items-center.bg-black
    img(
      ref="itemPreview"
      :src="item.item.content.thumbUrl" draggable="false"
      @load="previewLoad"
      :style=`{
        width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
        borderRadius: '10px'}`)
    //- cuts
    div(
      v-if="previewLoaded && item.item.cuts"
      :style=`{position: 'absolute', top: '8px', left: '8px'}`
      ).row.full-width
      div(v-for="(c, ci) in item.item.cuts" :key="ci"
        ).q-mr-xs
        div(:style=`{background: c.color, borderRadius: '10px'}`).q-px-sm
          small.text-white {{ $time(c.points[0].x)}}-{{$time(c.points[1].x) }}
    //- small(:style=`{position: 'absolute', zIndex: 100, top: '8px', right: '8px'}`).text-white {{ item.type }}
    q-btn(
      v-if="previewLoaded"
      round dense flat color="white" icon="more_vert" @click="$emit('action')"
      :style=`{position: 'absolute', zIndex: 100, top: '8px', right: '8px', background: 'rgba(0,0,0,0.15)'}`).shadow-1
    //- fragment name
    small(
      v-if="previewLoaded && item.item.name"
      :style=`{position: 'absolute', zIndex: 100, bottom: '50px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
      ).q-pa-sm.text-white {{ item.item.name | cut(20) }}
    //- framgent content name
    small(
      v-if="previewLoaded"
      :style=`{position: 'absolute', zIndex: 100, bottom: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.8)'}`
      ).q-pa-sm.text-white {{ item.item.content.name | cut(20) }}
</template>

<script>
export default {
  name: 'wsItemFragment',
  props: ['index', 'item'],
  data () {
    return {
      previewLoaded: false,
      previewHeight: 0,
      previewWidth: 0
    }
  },
  methods: {
    previewLoad () {
      // this.$log('previewLoad')
      let h = this.$refs.itemPreview.clientHeight
      let w = this.$refs.itemPreview.clientWidth
      this.previewHeight = h
      this.previewWidth = w
      this.previewLoaded = true
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
