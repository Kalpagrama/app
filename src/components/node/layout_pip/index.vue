<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.bg-grey-9
  //- debug
  div(
    v-if="$store.state.ui.debug && false"
    :style=`{position: 'absolute', zIndex: 1000, top: '16px'}`).row.bg-green
    small.text-white.full-width active: {{ active }}
  //- inactive tint
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!active" @click="$emit('tintClick')"
      :style=`{position: 'absolute', zIndex: 190, opacity: 0.2, borderRadius: '10px'}`).row.fit.bg-grey-9
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
      div(:style=`{width: '40px', height: '40px', borderRadius: '50%'}`).row.bg-grey-3
    .col.full-height
      .row.fit.items-center.content-center.q-px-sm
        span.text-bold.text-grey-3 Ivan Motovilov
        small.full-width.text-grey-5 @ivanmoto
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="grey-6" icon="more_horiz")
  //- compositions wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100}`
    ).row.full-width.items-start.content-start.bg-black
    composition-list(
      ref="compositionList" :ctx="ctx"
      :compositions="compositions"
      :visible="visible" :active="active"
      @height="$emit('height', $event)"
      @error="$event => $emit('error', $event)")
  //- name
  div(
    ref="nodeName"
    :style=`{minHeight: '60px'}`
    ).row.full-width
    div(:style=`{width: '60px', minHeight: '60px'}`).row.full-height.items-center.content-center.justify-center
      q-btn(round push color="green" icon="blur_on" :style=`{borderRadius: '50% !important'}`)
    div(:style=`{minHeight: '60px'}`).col
      .row.fit.items-center.content-center.q-px-sm
        router-link(:to="'/node/'+node.oid")
          span.text-bold.text-grey-3.cursor-pointer {{ node.name }}
    div(:style=`{width: '60px', minHeight: '60px'}`).row.full-height.items-center.content-center.justify-center
      q-btn(
        v-if="nodeFull && nodeFull.spheres.length > 0"
        round flat color="grey-3" @click="nodeOpen()"
        :icon="opened ? 'keyboard_arrow_up' : 'style'" )
  //- opened state
  //- spheres
  div(
    v-if="nodeFull"
    :style=`{height: openedHeight+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start.q-px-sm
    div(:style=`{height: '100px', marginBottom: -openedHeight+'px'}`).row.full-width
    router-link(
      v-for="(s,si) in nodeFull.spheres" :key="si"
      :to="'/sphere/'+s.oid"
      :style=`{borderRadius: '10px', userSelect: 'none'}`
      ).text-white.q-pa-sm.bg-grey-8.q-mr-sm.q-mb-sm.cursor-pointer {{ s.name }}
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'nodeLoad'],
  data () {
    return {
      // nodeOid: false
      offsetTop: 0,
      opened: false,
      openedHeight: 0
    }
  },
  computed: {
    compositions () {
      let res = []
      if (this.node.meta.compositions[0]) res.push({preview: this.node.meta.compositions[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[0] : null})
      if (this.node.meta.compositions[1]) res.push({preview: this.node.meta.compositions[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.compositions[1] : null})
      return res
    }
  },
  methods: {
    nodeOpen () {
      this.$log('nodeOpen')
      if (!this.nodeFull) return
      if (this.nodeFull.spheres.length === 0) return
      this.$tween.to(this, 0.3, {openedHeight: this.opened ? 0 : 100})
      this.opened = !this.opened
    }
  }
}
</script>
