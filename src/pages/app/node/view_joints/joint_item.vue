<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.items-between.fit
  //- left side with content: node, sphere, content, user
  .col.full-height
    //- item
    node-mini(
      v-if="item && item.type === 'NODE'"
      :isActive="isActive" :isVisible="isVisible"
      :node="item"
      :marginBottom="80")
    div(
      v-if="item && item.type === 'WORD'"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        marginTop: '50px',
        marginBottom: '30px',
      }`
      ).row.full-width.q-pa-sm.b-40
      span.text-white.q-ml-sm {{ item.name }}
    //- footer
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      joint-share(:joint="joint")
      joint-bookmark(:joint="joint")
      .col
      q-btn(
        @click="$router.push('/joint/'+joint.oid)"
        flat color="white" no-caps)
        span.text-white {{ itemType }}
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
    jointShare: () => import('components/joint/joint_share.vue')
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
