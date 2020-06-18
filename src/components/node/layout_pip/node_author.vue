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
      .col.full-height
        .row.fit.items-end.content-end.justify-end
          div(
            v-for="r in 2" :key="r"
            ).row.full-height.justify-center
            kalpa-avatar(:url="nodeFull.author.thumbUrl" :width="22" :height="22" @click.native="$router.push('/user/'+nodeFull.author.oid)")
            div(:style=`{order: -1}`).row.full-width.justify-center
              span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ (nodeFull.rate * 100) / 2 }}
  //- DUMMY !nodeFull
  div(v-if="!nodeFull").row.fit.items-center.content-center.justify-start
    div(
      :style=`{height: '40px', width: '150px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.b-80
  //- vote btn
  //- icon="blur_on"
  q-btn(
    v-if="!nodeIsMine"
    @click="voteStart()"
    round push
    color="green" size="lg"
    :loading="voteShow"
    :style=`{borderRadius: '50%'}`)
      span(
        v-if="nodeFull"
        :style=`{fontSize: '30px', userSelect: 'none'}`).text-white.text-bold {{ nodeFull.rate * 100 }}
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
