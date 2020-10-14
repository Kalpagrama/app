<template lang="pug">
.row.full-width.justify-center.items-center.content-center
  q-dialog(
    v-model="showStats" position="bottom")
    link-stats(
      :link="link" :isActive="isActive" :isVisible="isVisible"
      @close="showStats = false")
  //- actions wrapper
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
    //- share
    .row.full-height.justify-center
      link-share(:link="link").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ link.countBookmarks > 100 ? '99+' : link.countShares }}
    //- remake
    //- .row.full-height.justify-center
      link-remake(:link="link").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ link.countBookmarks > 100 ? '99+' : link.countRemakes }}
    //- bookmark
    .row.full-height.justify-center
      link-bookmark(:link="link" :isActive="isActive" :isVisible="isVisible").shaking
      .row.full-width.justify-center
        small.text-grey-8 {{ link.countBookmarks > 100 ? '99+' : link.countBookmarks }}
    //- link
    //- .row.full-height.justify-center
      q-btn(
        @click="$router.push('/workspace/link/new?oid='+link.oid)"
        round flat color="green").shaking
        q-icon(name="link" size="30px" color="green")
      .row.full-width.justify-center
        small.text-grey-8 {{ link.countBookmarks > 100 ? '99+' : link.countJoints }}
    //- vote
    .col
      .row.full-width.items-center.content-center.justify-end
        q-btn(
          @click="showStats = true"
          flat dense no-caps color="grey-2")
          span.text-white.text-bold {{ $nodeRateTitle(link.rate) }}
        .row.full-height.justify-center
          link-vote(:link="link")
          .row.full-width.justify-center
            small.text-grey-8 {{ link.countBookmarks > 100 ? '99+' : link.countVotes }}
</template>

<script>
export default {
  name: 'linkActions',
  props: ['link', 'isActive', 'isVisible'],
  components: {
    linkRemake: () => import('components/link/link_remake.vue'),
    linkBookmark: () => import('components/link/link_bookmark.vue'),
    linkShare: () => import('components/link/link_share.vue'),
    linkStats: () => import('components/link/link_stats/index.vue'),
    linkVote: () => import('components/link/link_vote.vue')
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
