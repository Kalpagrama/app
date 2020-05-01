<style lang="sass" scoped>
.essence
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
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
      :visible="visible" :active="active" :mini="mini"
      @height="$emit('meta', ['height', $event])")
    vote(v-if="voteShow" :oid="node.oid" @end="voteShow = false")
  //- essence
  router-link(
    v-if="essence"
    :to="'/node/'+node.oid"
    :class=`{
      'essence': ctx !== 'explorer'
    }`
    :style=`{height: '60px', marginTop: '-10px'}`
    ).row.full-width.items-center.content-center.justify-start.q-px-md.q-py-sm.bg-grey-9
    span.text-white.text-bold {{ node.name }}
  //- author and vote
  div(
    v-if="opened && nodeFull"
    :style=`{height: '60px'}`
    ).row.full-width.items-center.content-center.q-px-md.q-py-sm.bg-grey-9
    kalpa-avatar(:url="nodeFull.author.thumbUrl" :width="42" :height="42" @click.native="$router.push('/user/'+nodeFull.author.oid)")
    router-link(:to="'/user/'+nodeFull.author.oid").col
      .row.fit.items-center.content-center.q-px-sm
        span(:style=`{lineHeight: 1.2}`).text-white {{nodeFull.author.name}}
        small(:style=`{lineHeight: 1, margin: 0, padding: 0}`).text-white.full-width {{nodeFull.author.name}}
    .col
      .row.fit.items-center.content-center.justify-end.q-px-sm
        span(:style=`{fontSize: '24px'}`).text-white.text-bold {{nodeFull.rate}}
    q-btn(
      round push color="green" icon="blur_on" @click="voteStart()"
      :loading="voteShow"
      :style=`{borderRadius: '50%'}`)
  //- spheres
  div(
    v-if="opened && nodeFull && nodeFull.spheres.length > 9"
    :style=`{height: 60+'px', overflow: 'hidden'}`).row.full-width.items-start.content-start.q-py-sm.q-px-md
    //- div(:style=`{height: '100px', marginBottom: -openedHeight+'px'}`).row.full-width
    //- target="_blank"
    router-link(
      v-for="(s,si) in nodeFull.spheres" :key="si"
      :to="'/sphere/'+s.oid"
      :style=`{borderRadius: '10px', userSelect: 'none'}`
      ).text-white.q-px-sm.q-py-xs.bg-grey-8.q-mr-xs.q-mb-xs.cursor-pointer
      small {{ s.name }}
</template>

<script>
// import { openURL } from 'quasar'
import vote from './vote'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened', 'nodeLoad'],
  components: {vote},
  data () {
    return {
      composition: null,
      voteShow: false
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
    voteStart () {
      this.$log('voteStart')
      if (this.voteShow) {
        this.voteShow = false
      }
      else {
        this.voteShow = true
      }
    }
  }
}
</script>
