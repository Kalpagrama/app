<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  //- tint for nodeClick event
  div(v-if="!active" :style=`{position: 'absolute', zIndex: 101}` @click="$emit('nodeClick')").row.fit
  //- first preview wrapper
  div(:style=`{position: 'relative', minHeight: '200px', maxHeight: width+'px', borderRadius: '10px', overflow: 'hidden'}`
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
      ).text-center.cursor-pointer {{ $t(node.name) }}
  div(v-if="opened" :style=`{position: 'relative', maxHeight: width+'px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.bg-black
    img(
      :src="node.meta.fragments[1].thumbUrl" draggable="false"
      :style=`{width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none'}`)
  //- debug
  div(v-if="debug").row.full-width.bg-red
    small.full-width nodeIndex: {{ nodeIndex }}
    small.full-width oid: {{ node.oid }}
</template>

<script>
export default {
  name: 'nodeTape__node',
  props: ['width', 'active', 'opened', 'node', 'nodeIndex'],
  data () {
    return {
      debug: false,
      height: 0,
      nodeFull: null
    }
  },
  watch: {
    active: {
      immediate: true,
      handler (to, from) {
        this.$logD('active CHANGE', to, this.node.name)
      }
    },
    opened: {
      handler (to, from) {
        this.$logD('opened CHANGED', to)
        if (to) {
        }
      }
    }
  },
  methods: {
    nameClick () {
      this.$logD('nameClick')
      // this.$emit('nodeName')
    },
    imgFirstLoaded (e) {
      // this.$logD('imgFirstLoaded', e.target.height)
      this.height = e.target.height
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
