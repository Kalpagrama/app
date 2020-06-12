<template lang="pug">
div(
  :style=`{
    height: '60px',
  }`
  ).row.full-width.items-center.content-center.q-px-md.q-py-sm
  div(v-if="nodeFull").col.full-height
    .row.fit.items-center.content-center
      //- user avatar
      kalpa-avatar(:url="nodeFull.author.thumbUrl" :width="42" :height="42" @click.native="$router.push('/user/'+nodeFull.author.oid)")
      //- user name
      router-link(:to="'/user/'+nodeFull.author.oid").col
        .row.fit.items-center.content-center.q-px-md
          span(:style=`{lineHeight: 1.2}`).text-white.text-bold {{ nodeFull.author.name }}
          small(:style=`{lineHeight: 1, margin: 0, padding: 0}`).text-white.full-width {{ nodeFull.author.name }}
      //- center
      .col
        .row.fit.items-center.content-center.justify-end.q-px-sm
          span(:style=`{fontSize: '24px', userSelect: 'none'}`).text-white.text-bold {{ nodeFull.rate }}
  //- DUMMY !nodeFull
  div(v-if="!nodeFull").row.fit.items-center.content-center.justify-start
    div(
      :style=`{height: '40px', width: '150px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.b-80
  //- vote btn
  q-btn(
    v-if="!nodeIsMine"
    round push color="green" icon="blur_on" @click="voteStart()"
    :loading="voteShow"
    :style=`{borderRadius: '50%'}`)
</template>

<script>
export default {
  name: 'nodeLayoutPip-nodeAuthor',
  props: ['node', 'nodeFull', 'stateNode'],
  data () {
    return {
    }
  },
  computed: {
    nodeIsMine () {
      if (this.nodeFull) {
        return this.nodeFull.author.oid === this.$store.getters.currentUser().oid
      }
      else {
        return true
      }
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      this.stateNode.set('showVote', true)
    }
  }
}
</script>
