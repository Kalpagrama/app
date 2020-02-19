<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="$store.state.ui.debug"
    :style=`{position: 'absolute', zIndex: 1000, top: '16px'}`).row.bg-green
    small.text-white.full-width active: {{ active }}
  //- inactive tint
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="!active" :style=`{position: 'absolute', zIndex: 300, opacity: 0.4, borderRadius: '10px'}`).row.fit.bg-grey-10
  //- compositions wrapper
  //- img(:src="compositions[0].preview").full-width.br
  //- span(@click="open(compositions[0].preview)") {{compositions[0].preview}}
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100}`
    ).row.full-width.items-start.content-start.bg-black
    composition-list(
      ref="compositionList" :ctx="ctx"
      :compositions="compositions"
      :visible="visible" :active="active"
      @error="$event => $emit('error', $event)")
  //- name
  div(
    ref="nodeName" @click="nodeNameClick()"
    :style=`{minHeight: '50px'}`
    ).row.full-width.items-center.justify-center.cursor-pointer
    span.text-bold.text-center.cursor-pointer {{ node.name }}
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'nodeLoad'],
  data () {
    return {
    }
  },
  computed: {
    compositions () {
      return [
        {preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null},
        {preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null}
      ]
    }
  },
  watch: {
    active: {
      immediate: true,
      async handler (to, from) {
        // this.$log('active CHANGED', to)
        if (to) this.play()
        else this.pause()
      }
    }
  },
  methods: {
    open (url) {
      openURL(url)
    },
    play () {
      // this.$log('play')
      if (this.$refs.compositionList) this.$refs.compositionList.play()
    },
    pause () {
      // this.$log('pause')
      if (this.$refs.compositionList) this.$refs.compositionList.pause()
    },
    async nodeNameClick () {
      this.$log('nodeNameClick')
      this.pause()
      this.$emit('open')
    }
  }
}
</script>
