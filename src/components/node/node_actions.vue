<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '700px'}`).row.full-width.items-center.content-center.q-mb-xs
    //- share
    div(:style=`{position: 'relative',}`).row.full-height.justify-center
      node-share(:node="node").shaking
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '-4px',}`).row.full-width.justify-center
        small.text-grey-8 {{ node.countShares > 100 ? '99+' : node.countShares }}
    //- remake
    div(:style=`{position: 'relative',}`).row.full-height.justify-center
      node-remake(:node="node").shaking
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '-4px',}`).row.full-width.justify-center
        small.text-grey-8 {{ node.countRemakes > 100 ? '99+' : node.countRemakes }}
    //- bookmark
    div(:style=`{position: 'relative',}`).row.full-height.justify-center
      node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible").shaking
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '-4px',}`).row.full-width.justify-center
        small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countBookmarks }}
    //- link
    div(:style=`{position: 'relative',}`).row.full-height.justify-center
      q-btn(
        @click="$router.push('/workspace/link/new?oid='+node.oid)"
        round flat color="green").shaking
        q-icon(name="link" size="30px" color="grey-9")
      div(:style=`{position: 'absolute', zIndex: 100, bottom: '-4px',}`).row.full-width.justify-center
        small.text-grey-8 {{ node.countJoints > 100 ? '99+' : node.countJoints }}
    //- vote
    .col
    div(:style=`{width: '60px'}`).row.justify-center
      node-vote(:node="node")
      //- div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start.justify-end
        //- q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2").q-mt-sm
          span.text-white.text-bold {{ $nodeRateTitle(node.rate) }}
        .row.full-height.justify-center
          node-vote(:node="node")
          //- div(:style=`{position: 'absolute', zIndex: 100, bottom: '-4px',}`).row.full-width.justify-center
            small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countVotes }}
</template>

<script>
export default {
  name: 'nodeActions',
  props: ['node', 'isActive', 'isVisible'],
  components: {
    nodeRemake: () => import('components/node/node_remake.vue'),
    nodeBookmark: () => import('components/node/node_bookmark.vue'),
    nodeShare: () => import('components/node/node_share.vue'),
    nodeStats: () => import('components/node/node_stats/index.vue'),
    nodeVote: () => import('components/node/node_vote.vue')
  },
  data () {
    return {
      showStats: false,
    }
  },
  methods: {
  }
}
</script>
