<template lang="pug">
div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start
  //- action dialogs
  //- q-dialog(v-model="compositionFinderOpened").bg-black
  //-   composition-finder(@layer="layerFound").bg-black
  //- fragments wrapper
  div(
    :style=`{
      position: 'relative',
      minHeight: previewHeight+'px', borderRadius: '10px', overflow: 'hidden',
      height: previewHeight > 0 ? previewHeight+'px' : 'auto'}`
    ).row.full-width.items-start.bg-black
    composition(
      ref="fragmentFirst"
      :ctx="ctx" :index="0"
      :thumbUrl="node.meta.compositions[0].thumbUrl"
      @previewWidth="$event => fragmentWidth(0, $event)" @previewHeight="$event => fragmentHeight(0, $event)"
      :composition="nodeFull ? nodeFull.compositions[0] : null"
      :mini="fragmentMini === 0" @mini="fragmentChange(0)" :visible="visible"
      :style=`{
        position: previewHeight > 0 ? 'absolute' : 'relative', zIndex: fragmentMini === 0 ? 200 : 150,
        opacity: styles[0].opacity, borderRadius: '10px', overflow: 'hidden',
        maxWidth: styles[0].maxWidth+'%',
        bottom: styles[0].bottom+'px',
        right: styles[0].right+'px'}`)
    composition(
      ref="fragmentSecond"
      :ctx="ctx" :index="1" :thumbUrl="node.meta.compositions[1].thumbUrl"
      @previewWidth="$event => fragmentWidth(1, $event)" @previewHeight="$event => fragmentHeight(1, $event)"
      :composition="nodeFull ? nodeFull.compositions[1] : null"
      :mini="fragmentMini === 1" @mini="fragmentChange(1)" :visible="visible"
      :style=`{
        position: 'absolute', zIndex: fragmentMini === 1 ? 200 : 150,
        height: fragmentMini === 1 ? 'auto' : previewHeight+'px',
        opacity: styles[1].opacity, borderRadius: '10px', overflow: 'hidden',
        maxWidth: styles[1].maxWidth+'%',
        bottom: styles[1].bottom+'px',
        right: styles[1].right+'px'}`)
  //- name, essence
  div(
    v-if="true"
    ref="nodeName" @click="$emit('open'), pause()"
    :style=`{minHeight: '60px'}`
    ).row.full-width.items-center.justify-center.cursor-pointer
    span.text-bold.text-center.cursor-pointer {{ node.name }}
</template>

<script>
export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'opened', 'node', 'nodeFull', 'needFull', 'needFullPreload', 'nodeFullReady', 'visible'],
  components: {},
  data () {
    return {
      previewHeight: 0,
      previewWidth: 0,
      fragmentMini: 1,
      fragmentMiniStart: 1,
      stylesMini: {right: 20, bottom: 40, maxWidth: 20, maxHeight: 20},
      stylesMaxi: {right: 0, bottom: 0, maxWidth: 100, maxHeight: 100},
      styles: [{right: 0, bottom: 0, maxWidth: 100, opacity: 1}, {right: 20, bottom: 40, maxWidth: 20, opacity: 1}],
    }
  },
  watch: {
    visible: {
      immediate: false,
      async handler (to, from) {
        this.$log('visible CHANGED', to)
        if (to) this.play()
        else this.pause()
      }
    }
  },
  methods: {
    async play () {
      if (this.nodeFull) {
        if (this.fragmentMini === 0) await this.$refs.fragmentSecond.play()
        else await this.$refs.fragmentFirst.play()
      }
    },
    pause () {
      this.$log('pause')
      if (this.fragmentMini === 0) this.$refs.fragmentSecond.pause()
      else this.$refs.fragmentFirst.pause()
    },
    fragmentWidth (index, width) {
      // this.$log('fragmentWidth', index, width)
      if (index === 0) {
        this.previewWidth = width
        this.$emit('previewWidth', width)
      }
    },
    fragmentHeight (index, height) {
      // this.$log('fragmentHeight', index, height)
      if (index === 0) {
        this.previewHeight = height
        // this.$emit('previewHeight', height)
        if (this.visible) this.play()
        // TODO: emit scrollTop event of node in scroll wrapper
        // this.$emit('scrollTop', this.$el.scrollHeight)
      }
    },
    async fragmentChange (index) {
      this.$log('fragmentChange', index)
      this.fragmentMiniStart = index === 0 ? 1 : 0
      this.$tween.to(
        this.styles[index],
        0.65,
        {
          maxWidth: 100,
          right: 0,
          bottom: 0,
          onComplete: () => {
            this.fragmentMini = index === 0 ? 1 : 0
            this.fragmentMiniStart = index === 0 ? 1 : 0
            this.styles[index === 0 ? 1 : 0].opacity = 0
            this.$tween.to(this.styles[index === 0 ? 1 : 0], 0.1, {
              maxWidth: 5,
              right: 16,
              bottom: 32,
              onComplete: () => {
                this.$tween.to(this.styles[index === 0 ? 1 : 0], 0.1, {
                  maxWidth: 25,
                  opacity: 1
                })
              }
            })
          }
        }
      )
      if (index === 0) {
        this.$refs.fragmentFirst.play()
        this.$refs.fragmentSecond.pause()
      } else {
        this.$refs.fragmentFirst.pause()
        this.$refs.fragmentSecond.play()
      }
    },
    nodeNameClick () {
      this.$log('nodeNameClick')
      this.$emit('open')
    }
  },
  mounted () {
    this.$log('mounted')
    // this.play()
  }
}
</script>
