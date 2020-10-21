<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    joint-stats(
      :joint="joint" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    //- share
    joint-share(:joint="joint")
    //- .row.full-height.justify-center
      joint-share(:joint="joint").shaking
      //- .row.full-width.justify-center
        small.text-grey-8 {{ joint.countBookmarks > 100 ? '99+' : joint.countShares }}
    //- remake
    //- .row.full-height.justify-center
      joint-remake(:joint="joint").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ joint.countBookmarks > 100 ? '99+' : joint.countRemakes }}
    //- bookmark
    //- .row.full-height.justify-center
    joint-bookmark(:joint="joint" :isActive="isActive" :isVisible="isVisible").shaking
      //- .row.full-width.justify-center
      //-   small.text-grey-8 {{ joint.countBookmarks > 100 ? '99+' : joint.countBookmarks }}
    //- v
    //- .row.full-height.justify-center
      q-btn(
        @click="$router.push('/workspace/joint/new?oid='+joint.oid)"
        round flat color="green").shaking
        q-icon(name="link" size="30px" color="green")
      .row.full-width.justify-center
        small.text-grey-8 {{ joint.countBookmarks > 100 ? '99+' : joint.countJoints }}
    //- vote
    .col
      div().row.full-width.items-center.content-center.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2")
          span.text-white.text-bold.q-mx-sm 82
          //- span.text-white.text-bold {{ $nodeRateTitle(joint.rate) }}
        div(v-if="!noVote").row.full-height.justify-center
          joint-vote(:joint="joint")
          //- .row.full-width.justify-center
            small.text-grey-8 {{ joint.countBookmarks > 100 ? '99+' : joint.countVotes }}
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
