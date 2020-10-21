<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.items-between.fit
  //- left side with content: node, sphere, content, user
  .col.full-height
    //- body
    div(
      :style=`{
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`).row.full-width
      //- author
      .row.full-width.items-center.content-center.q-pa-xs
        q-btn(
          :to="'/user/'+joint.author.oid"
          flat color="white" dense no-caps
          )
          user-avatar(:url="joint.author.thumbUrl" :width="24" :height="24")
          span.text-grey-4.q-ml-sm {{ joint.author.name }}
        .col
        small.text-grey-8.q-mr-xs {{ joint.countViews }}
        q-icon(name="visibility" color="grey-8").q-mr-md
        small.text-grey-8.q-mr-sm {{ $date(joint.createdAt, 'DD.MM.YYYY') }}
      .row.full-width
      joint-item(:item="item" :isActive="isActive" :isVisible="isVisible")
    //- footer
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      joint-share(:joint="joint" :isActive="isActive" :isVisible="isVisible")
      joint-bookmark(:joint="joint" :isActive="isActive" :isVisible="isVisible")
      .col
      q-btn(
        @click="$router.push('/joint/'+joint.oid)"
        flat color="white" no-caps)
        span(v-if="jointType !== 'ESSENCE'").text-white {{ itemType }}
        span(v-else).text-white {{ joint.name }}
      q-btn(
        @click="showVotes = true"
        flat color="white" no-caps round)
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ joint.rate*100 }}
  //- right padding for real
  div(:style=`{width: '60px',}`).row.full-height.justify-center
  //- right side for line and voting for the joint...
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
      width: '60px', minHeight: '100px',
    }`
    ).row.full-height.justify-center
    div(:style=`{height: '100%', width: '2px'}`).bg-green
    div(
      v-if="item"
      :style=`{
        position: 'absolute', zIndex: 1100, bottom: '0px',
        marginBottom: '60px'
      }`
      ).row.full-width.justify-center
      joint-vote(
        :joint="joint"
        :style=`{
          height: '60px',
        }`).full-width.justify-center.b-30
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointItem',
  props: ['node', 'joint', 'isActive', 'isVisible'],
  components: {
    jointVote: () => import('components/joint/joint_vote.vue'),
    jointActions: () => import('components/joint/joint_actions.vue'),
    jointBookmark: () => import('components/joint/joint_bookmark.vue'),
    jointShare: () => import('components/joint/joint_share.vue'),
    jointItem: () => import('components/joint/joint_item.vue')
  },
  data () {
    return {
      showVotes: false,
    }
  },
  computed: {
    item () {
      if (this.joint.leftItem.oid === this.node.oid) return this.joint.rightItem
      else return this.joint.leftItem
    },
    itemType () {
      // left item is ok
      if (this.joint.leftItem.oid === this.node.oid) {
        return this.joint.jointType.split('_')[0]
      }
      // need swap
      else {
        return this.joint.jointType.split('_')[1]
      }
    },
  },
  methods: {
    async vote () {
      this.$log('vote')
    }
  }
}
</script>
