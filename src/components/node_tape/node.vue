<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  //- tint for nodeClick event
  div(v-if="!active" :style=`{position: 'absolute', zIndex: 101}` @click="$emit('nodeClick')").row.fit
  //- first preview wrapper
  div(:style=`{position: 'relative', maxHeight: width+'px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.bg-black
    img(
      @load="imgFirstLoaded"
      :src="node.meta.fragments[0].thumbUrl" draggable="false"
      :style=`{width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none'}`)
    img(
      :src="node.meta.fragments[1].thumbUrl" draggable="false"
      :style=`{
        position: 'absolute', zIndex: 100, right: '10px', bottom: '10px',
        borderRadius: '10px', overflow: 'hidden', userSelect: 'none',
        width: '100px', objectFit: 'contain'}`
    )
  //- name
  div(:style=`{minHeight: '60px'}`).row.full-width.justify-center.items-center.q-pa-sm
    span(
      @click="nameClick()"
      :style=`{userSelect: 'none'}`
      ).text-center.cursor-pointer {{ node.name }}
  div(v-if="opened" :style=`{position: 'relative', maxHeight: width+'px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.bg-black
    img(
      :src="node.meta.fragments[1].thumbUrl" draggable="false"
      :style=`{width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none'}`)
</template>

<script>
export default {
  name: 'nodeTape__node',
  props: ['width', 'active', 'opened', 'node', 'nodeIndex'],
  data () {
    return {
      height: 0,
      nodeFull: null
    }
  },
  watch: {
    opened: {
      handler (to, from) {
        this.$log('opened CHANGED', to)
        if (to) {
        }
      }
    }
  },
  methods: {
    nameClick () {
      this.$log('nameClick')
      this.$emit('nodeName')
    },
    imgFirstLoaded (e) {
      // this.$log('imgFirstLoaded', e.target.height)
      this.height = e.target.height
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
