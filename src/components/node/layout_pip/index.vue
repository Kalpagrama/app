<style lang="sass" scoped>
.essence
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- debug
  div(
    v-if="false"
    :style=`{
      position: 'absolute',
      zIndex: 1000,
      right: '0px', top: '50px',
      fontSize: '12px',
      width: '80px'
    }`
    ).row.text-white.bg-pink-5
    small.full-width {{node.oid}}
    small.full-width visible: {{visible}}
    small.full-width active: {{active}}
    small(v-if="nodeFull").full-width items: {{nodeFull.items.length}}
  //- //- inactive tint
  //- transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
  //-   div(
  //-     v-if="!active" @click="$emit('tintClick')"
  //-     :style=`{position: 'absolute', zIndex: 300, borderRadius: '10px', background: 'rgba(0,0,0,0.0)'}`).row.fit
  //- items wrapper
  div(
    :style=`{
      position: 'relative', zIndex: 101,
      borderRadius: '10px', overflow: 'hidden',
      marginBottom: '-10px'
    }`
    ).row.full-width.items-start.content-start
    items-player(v-bind="$props" :ctx="ctx")
    //- voting
    vote(v-if="voteShow" :oid="node.oid" @end="voteShow = false")
  //- essence
  router-link(
    v-if="essence"
    :to="'/node/'+node.oid"
    :class=`{
      'b-50': !visible && !active,
      'b-70': visible && !active,
      'b-90': visible && active
    }`
    :style=`{zIndex: 100, height: '70px', borderRadius: '0 0 10px 10px', overflow: 'hidden', marginBottom: '-10px'}`
    ).row.full-width.items-center.content-center.justify-start.q-px-md.q-py-sm
    span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
  //- author and vote
  div(
    v-if="opened && nodeFull"
    :style=`{zIndex: 99, height: '80px', borderRadius: '0 0 10px 10px', marginBottom: '-10px'}`
    ).row.full-width.items-center.content-center.q-px-md.q-py-sm.bg-grey-9
    kalpa-avatar(:url="nodeFull.author.thumbUrl" :width="42" :height="42" @click.native="$router.push('/user/'+nodeFull.author.oid)")
    router-link(:to="'/user/'+nodeFull.author.oid").col
      .row.fit.items-center.content-center.q-px-md
        span(:style=`{lineHeight: 1.2}`).text-white.text-bold {{nodeFull.author.name}}
        small(:style=`{lineHeight: 1, margin: 0, padding: 0}`).text-white.full-width {{nodeFull.author.name}}
    .col
      .row.fit.items-center.content-center.justify-end.q-px-sm
        span(:style=`{fontSize: '24px'}`).text-white.text-bold {{nodeFull.rate}}
    q-btn(
      v-if="!nodeIsMine"
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
import itemsPlayer from './items_player'
import vote from './vote'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened', 'nodeLoad'],
  components: {itemsPlayer, vote},
  data () {
    return {
      voteShow: false
    }
  },
  computed: {
    nodeIsMine () {
      if (this.nodeFull) {
        return this.nodeFull.author.oid === this.$store.getters.currentUser.oid
      }
      else {
        return true
      }
    }
  },
  watch: {
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
