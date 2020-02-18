<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px'}`).row.full-width.items-start.content-start
  //- inactive tint
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="!active" :style=`{position: 'absolute', zIndex: 300, opacity: 0.4, borderRadius: '10px'}`).row.fit.bg-grey-10
  //- compositions wrapper
  div(
    :style=`{
      position: 'relative',
      minHeight: compositionHeight+'px',
      height: compositionHeight+'px',
      borderRadius: '10px', overflow: 'hidden', zIndex: 100,
      height: previewHeight > 0 ? previewHeight+'px' : 'auto'}`
    ).row.full-width.items-start.bg-black
    composition(
      ref="compositionOne"
      :ctx="ctx" :index="0" :thumbUrl="node.meta.compositions[0].thumbUrl" :fullHeight="false"
      :composition="nodeFull ? nodeFull.compositions[0] : null"
      :mini="compositionMiniIndex === 0" :visible="false" :active="false"
      @mini="compositionChange(0)" @ended="compositionChange(0)"
      @height="compositionWidth = $event" @width="compositionHeight = $event"
      :style=`{
        position: compositionHeight > 0 ? 'absolute' : 'relative', zIndex: compositionMiniIndex === 0 ? 200 : 150,
        opacity: styles[0].opacity, borderRadius: '10px', overflow: 'hidden',
        maxWidth: styles[0].maxWidth+'%',
        bottom: styles[0].bottom+'px',
        right: styles[0].right+'px'}`)
    composition(
      ref="compositionTwo"
      :ctx="ctx" :index="1" :thumbUrl="node.meta.compositions[1].thumbUrl" :fullHeight="true"
      :composition="nodeFull ? nodeFull.compositions[1] : null"
      :mini="compositionMiniIndex === 1" :visible="false" :active="false"
      @mini="compositionChange(1)" @ended="compositionChange(1)"
      :style=`{
        position: 'absolute', zIndex: compositionMiniIndex === 1 ? 200 : 150,
        height: compositionMiniIndex === 1 ? 'auto' : previewHeight+'px',
        opacity: styles[1].opacity, borderRadius: '10px', overflow: 'hidden',
        maxWidth: styles[1].maxWidth+'%',
        bottom: styles[1].bottom+'px',
        right: styles[1].right+'px'}`)
  //- name
  div(
    ref="nodeName" @click="nodeNameClick()"
    :style=`{minHeight: '60px'}`
    ).row.full-width.items-center.justify-center.cursor-pointer
    span.text-bold.text-center.cursor-pointer {{ node.name }}
</template>

<script>
export default {
  name: 'nodeLayoutPip2',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'nodeLoad'],
  data () {
    return {
      styles: [{right: 0, bottom: 0, maxWidth: 140, opacity: 1}, {right: 10, bottom: 10, maxWidth: 30, opacity: 0.8}],
      compositionHeight: 0,
      compositionWidth: 0,
      compositionMiniIndex: 1
    }
  },
  watch: {
    active: {
      immediate: false,
      async handler (to, from) {
        this.$log('active CHANGED', to)
        if (to) this.play()
        else this.pause()
      }
    }
  },
  methods: {
    play () {
      if (!this.nodeFull) return
      if (this.compositionMiniIndex === 0) this.$refs.compositionOne.play()
      else this.$refs.compositionTwo.play()
    },
    pause () {
      this.$log('pause')
      if (!this.nodeFull) return
      // pause all compositions...
      this.$refs.compositionOne.pause()
      this.$refs.compositionTwo.pause()
    },
    compositionChange (index) {
      this.$log('compositionChange', index)
      this.$tween.to(
        this.styles[index],
        0.65,
        {
          width: this.compositionWidth,
          height: this.compositionHeight,
          onComplete: () => {
            this.$tween.to(
              this.styles[index === 0 ? 1 : 0],
              0.1,
              {
                width: this.compositionWidth / 5,
                height: 100
              }
            )
          }
        }
      )
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
              right: 10,
              bottom: 10,
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
    async nodeNameClick () {
      this.$log('nodeNameClick')
      // load nodeFull in case we clicked on not loaded node? is it possible?
      if (!this.nodeFull) await this.nodeLoad()
      this.$emit('open')
      this.pause()
    }
  }
}
</script>
