<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.bg-grey-9
  //- //- inactive tint
  //- transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
  //-   div(
  //-     v-if="!active" @click="$emit('tintClick')"
  //-     :style=`{position: 'absolute', zIndex: 300, borderRadius: '10px', background: 'rgba(0,0,0,0.0)'}`).row.fit
  //- items wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100}`
    ).row.full-width.items-start.content-start.bg-black
    composition(
      :preview="node.meta.items[0].thumbUrl"
      :value="composition"
      :visible="visible" :active="active" :mini="mini")
  //- essence
  div(
    v-if="essence"
    :style=`{minHeight: '50px'}`
    ).row.full-width.items-center.content-center.justify-start.q-px-md.q-py-sm
    router-link(:to="'/sphere/'+sphereOid").text-white.text-bold {{ node.name }}
  //- author and vote
  div(
    v-if="opened && nodeFull"
    :style=`{height: '50px'}`
    ).row.full-width.items-center.content-center.q-px-md.q-py-sm.br
    kalpa-avatar(:url="nodeFull.author.thumbUrl" :width="36" :height="36" @click.native="userAvatarClick()")
    .col
    q-btn(round push color="green" icon="blur_on")
  //- spheres
  div(
    v-if="opened && nodeFull"
    :style=`{height: 100+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start.q-px-sm
    //- div(:style=`{height: '100px', marginBottom: -openedHeight+'px'}`).row.full-width
    router-link(
      v-for="(s,si) in nodeFull.spheres" :key="si"
      :to="'/sphere/'+s.oid"
      :style=`{borderRadius: '10px', userSelect: 'none'}`
      ).text-white.q-pa-sm.bg-grey-8.q-mr-sm.q-mb-sm.cursor-pointer {{ s.name }}
</template>

<script>
// import { openURL } from 'quasar'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'nodeLoad'],
  data () {
    return {
      opened: false,
      composition: null
    }
  },
  computed: {
    sphereOid () {
      if (this.nodeFull) {
        return this.nodeFull.sphereFromName.oid
      }
      else {
        return ''
      }
    }
    // items () {
    //   let res = []
    //   if (this.node.meta.items[0]) res.push({preview: this.node.meta.items[0].thumbUrl, composition: this.nodeFull ? this.nodeFull.items[0] : null})
    //   if (this.node.meta.items[1]) res.push({preview: this.node.meta.items[1].thumbUrl, composition: this.nodeFull ? this.nodeFull.items[1] : null})
    //   return res
    // }
  },
  watch: {
    nodeFull: {
      async handler (to, from) {
        this.$log('nodeFull CHANGED', to)
        if (to) {
          this.composition = await this.$store.dispatch('objects/get', {oid: to.items[0].oid})
        }
      }
    }
  },
  methods: {
  }
}
</script>
