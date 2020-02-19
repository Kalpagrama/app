<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px'}`).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="$store.state.ui.debug"
    :style=`{position: 'absolute', zIndex: 1000, top: '16px'}`).row.bg-green
    small.text-white.full-width compositionHeight: {{ compositionHeight }}
  //- inactive tint
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="!active" :style=`{position: 'absolute', zIndex: 300, opacity: 0.4, borderRadius: '10px'}`).row.fit.bg-grey-10
  //- compositions wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100}`
    ).row.full-width.items-start.content-start.bg-black
    composition-player(
      :ctx="ctx"
      :compositions="compositionsOne"
      :visible="visible" :active="active"
      @error="$emit('error')")
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
      compositionTwoHeight: 0,
      compositionHeight: 0,
      compositionWidth: 0,
      compositionMiniIndex: 1,
      styles: [
        {maxWidth: 0, height: 0, right: 0, bottom: 0, opacity: 1},
        {maxWidth: 0, height: 0, right: 0, bottom: 0, opacity: 0.8}
      ]
    }
  },
  computed: {
    compositionsOne () {
      return [
        {preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null},
        {preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null},
        // {preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null},
        // {preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null},
        // {preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null},
        // {preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null},
        // {preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null},
        // {preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null}
      ]
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
      // if (!this.nodeFull) return
      // if (this.compositionMiniIndex === 0) this.$refs.compositionOne.play()
      // else this.$refs.compositionTwo.play()
    },
    pause () {
      this.$log('pause')
      // if (!this.nodeFull) return
      // pause all compositions...
      // this.$refs.compositionOne.pause()
      // this.$refs.compositionTwo.pause()
    },
    compositionOneLoaded () {
      // this.$log('compositionOneLoaded', this.compositionWidth / 5)
      this.$set(this.styles[1], 'maxWidth', this.compositionWidth / 4)
      this.$set(this.styles[1], 'height', this.compositionTwoHeight)
      // this.styles[1].width = this.compositionWidth / 5
      // this.styles[1].height = this.compositionHeight / 5
    },
    compositionChange (index) {
      this.$log('compositionChange', index)
      this.$tween.to(
        this.styles[index],
        0.65,
        {
          maxWidth: this.compositionWidth,
          height: this.compositionHeight,
          onComplete: () => {
            this.$tween.to(
              this.styles[index === 0 ? 1 : 0],
              0.1,
              {
                maxWidth: this.compositionWidth / 4,
                height: 0
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
