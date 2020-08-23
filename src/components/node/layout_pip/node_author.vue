<style lang="sass" scoped>
.author-area
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    height: '40px',
  }`
  ).row.full-width.items-center.content-center.q-px-sm
  //- author width nodeFull
  div(
    v-if="nodeFull"
    ).col.full-height
    .row.fit.items-center.content-center.justify-start
      router-link(
        flat color="white" no-caps dense
        :to="'/user/'+nodeFull.author.oid"
        :style=`{
          padding: '0px', margin: '0px',
          height: '40px',
          position: 'relative',
          borderRadius: 30+'px',
          overflow: 'hidden',
        }`
        ).row.b-80.author-area
        //- user avatar
        user-avatar(
          :url="nodeFull.author.thumbUrl" :width="38" :height="38")
        //- user name
        .col.full-height
          .row.fit.items-center.content-center.justify-start.q-pl-sm
            span(:style=`{lineHeight: 1.2, margin: 0, padding: 0}`).text-white.text-bold {{ nodeFull.author.name }}
            .row.full-width
              small(:style=`{lineHeight: 1, margin: 0, padding: 0}`).text-grey-5 {{ nodeFull.author.name }}
  //- author DUMMY !nodeFull
  div(
    v-if="!nodeFull"
    ).col.full-height
    div(
      :style=`{
        height: '60px',
        width: '170px',
        borderRadius: '30px',
        overflow: 'hidden',
      }`
      ).row.items-center.content-center.justify-start.b-80.author-area
      div(:style=`{width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden',}`).b-90
  node-vote-view(:node="node" :nodeFull="nodeFull" :stateNode="stateNode")
</template>

<script>
import nodeVoteView from './node_vote_view'

export default {
  name: 'nodeLayoutPip-nodeAuthor',
  components: {nodeVoteView},
  props: ['node', 'nodeFull', 'stateNode'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
