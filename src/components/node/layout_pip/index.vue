<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="$store.state.ui.debug && false"
    :style=`{position: 'absolute', zIndex: 1000, top: '16px'}`).row.bg-green
    small.text-white.full-width active: {{ active }}
  //- inactive tint
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="!active" :style=`{position: 'absolute', zIndex: 300, opacity: 0.4, borderRadius: '10px'}`).row.fit.bg-grey-10
  //- compositions wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100}`
    ).row.full-width.items-start.content-start.bg-black
    composition-list(
      ref="compositionList" :ctx="ctx"
      :compositions="compositions" :nodeOid="nodeOid"
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
      nodeOid: false
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
        if (to) this.nodeOid = this.node.oid
        else this.nodeOid = false
      }
    },
    // visible: {
    //   handler (to, from) {
    //     this.$log('visible CHANGED', to)
    //   }
    // }
  },
  methods: {
    async nodeNameClick () {
      this.$log('nodeNameClick')
      this.$router.push('/node/' + this.node.oid).catch(e => e)
    }
  }
}
</script>
