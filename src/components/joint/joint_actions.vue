<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    joint-stats(
      :joint="joint" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    joint-share(:joint="joint")
    kalpa-bookmark(:oid="joint.oid" type="JOINT" :name="joint.name" :thumbUrl="joint.thumbUrl" :isActive="isActive" inactiveColor="grey-9").shaking
    //- vote
    .col.br
      .row.fit.items-center.content-center.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2")
          //- span.text-white.text-bold {{ $nodeRateTitle(node.rate) }}
          span.text-white.text-bold {{ joint.rate }}
    //- vote btn
    div(:style=`{width: '60px'}`).row.justify-center.br
      joint-vote(:joint="joint")
</template>

<script>
export default {
  name: 'jointActions',
  props: {
    joint: {type: Object},
    isActive: {type: Boolean, default: false},
    isVisible: {type: Boolean, default: false},
    noVote: {type: Boolean, default: false}
  },
  components: {
    jointRemake: () => import('components/joint/joint_remake.vue'),
    jointBookmark: () => import('components/joint/joint_bookmark.vue'),
    jointShare: () => import('components/joint/joint_share.vue'),
    jointStats: () => import('components/joint/joint_stats/index.vue'),
    jointVote: () => import('components/joint/joint_vote.vue')
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
