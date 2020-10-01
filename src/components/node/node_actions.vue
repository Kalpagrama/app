<template lang="pug">
.row.full-width.justify-center.items-center.content-center.q-px-sm
  q-dialog(
    v-model="showStats" position="bottom")
    node-stats(:node="node" :isActive="isActive" :isVisible="isVisible")
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    node-remake(:node="node")
    small.text-grey-9 {{ node.countRemakes > 100 ? '99+' : node.countRemakes }}
    .col
    q-btn(round flat color="grey-9" icon="link" @click="$router.push('/workspace/link/new')").shaking
    small.text-grey-9 {{ node.countJoints > 100 ? '99+' : node.countJoints }}
    .col
    node-share(:node="node").shaking
    .col
    small.text-grey-9 {{ node.countBookmarks > 100 ? '99+' : node.countBookmarks }}
    node-bookmark(:node="node" :isActive="isActive" :isVisible="isVisible" @done="showStats = true").shaking
    .col
    small.text-grey-9 {{ node.countVotes > 100 ? '99+' : node.countVotes }}
    node-vote(:node="node")
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
