<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(
      :node="node" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    node-share(:node="node").shaking
    .col
    node-remake(:node="node")
    small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countBookmarks }}
    .col
    node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible" @done="showStats = true").shaking
    small.text-grey-8 {{ node.countRemakes > 100 ? '99+' : node.countRemakes }}
    .col
    q-btn(
      @click="$router.push('/workspace/link/new?oid='+node.oid)"
      round flat color="green").shaking
      q-icon(name="link" size="30px" color="green")
    small.text-grey-8 {{ node.countJoints > 100 ? '99+' : node.countJoints }}
    .col
    small.text-grey-8 {{ node.countVotes > 100 ? '99+' : node.countVotes }}
    node-vote(:node="node")
    span.text-bold.text-grey-2 {{ node.rate * 100 }}
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    //- share
    .row.full-height.justify-center
      node-share(:node="node").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countShares }}
    //- remake
    .row.full-height.justify-center
      node-remake(:node="node").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countRemakes }}
    //- bookmark
    .row.full-height.justify-center
      node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countBookmarks }}
    //- link
    .row.full-height.justify-center
      q-btn(
        @click="$router.push('/workspace/link/new?oid='+node.oid)"
        round flat color="green").shaking
        q-icon(name="link" size="30px" color="green")
      .row.full-width.justify-center
        small.text-grey-8 {{ node.countBookmarks > 100 ? '99+' : node.countJoints }}
    //- vote
    .col
      .row.full-width.items-start.content-start.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2").q-mt-sm
          span.text-white.text-bold {{ $nodeRateTitle(node.rate) }}
        .row.full-height.justify-center
          node-vote(:node="node")
          .row.full-width.justify-center
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
    statsHolded () {
      this.$log('statsHolded')
      this.showStats = true
    }
  }
}
</script>
