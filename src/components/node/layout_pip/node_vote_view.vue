<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: 30+'px',
    overflow: 'hidden',
  }`
  ).row.items-center.content-center.b-80.q-pl-xs
  //- rateUser
  div(
    v-if="nodeFull && nodeFull.rateUser"
    ).row.full-height.items-center.content-center
    kalpa-avatar(
      v-for="i in 1" :key="i"
      @click.native="$router.push('/user/'+nodeFull.author.oid)"
      :url="$store.getters.currentUser().profile.photoUrl"
      :width="54" :height="54"
      :opacity="0.5 + (0.1*i)"
      :style=`{
        marginRight: '-25px',
        zIndex: 100+i,
      }`).cursor-pointer
      div(
        :style=`{
          position: 'absolute',
          borderRadius: '50%',
          overflow: 'hidden',
        }`
        ).row.fit.items-center.content-center.justify-start.q-pl-xs
        span(
          :style=`{
            userSelect: 'none',
          }`
          ).text-grey-2.text-bold {{ nodeFull.rateUser * 100 }}
  //- vote start btn
  q-btn(
    @click="voteStart()"
    round push
    color="green"
    :loading="stateNode.voteShow"
    :style=`{
      zIndex: 1000,
      width: '60px',
      height: '60px',
      borderRadius: '50%'
    }`).row.items-center.content-center.q-pa-xs
    span(
      v-if="nodeFull"
      :style=`{
        fontSize: '20px', userSelect: 'none',
        userSelect: 'none',
      }`
      ).text-white.text-bold.q-mt-xs {{ Math.round(nodeFull.rate * 100) }}
    .row.full-width.justify-center
      q-icon(
        color="white" name="emoji_people" size="22px")
</template>

<script>
export default {
  name: 'nodeVoteView',
  props: ['node', 'nodeFull', 'stateNode'],
  data () {
    return {
    }
  },
  methods: {
    voteStart () {
      this.$log('voteStart')
      // if (this.$q.screen.xs) {
      //   this.$q.bottomSheet({
      //     dark: true,
      //     title: 'Vote for essence!',
      //     message: 'How do you feel about it?',
      //     seamless: false,
      //     actions: [
      //       {id: 0.1, label: 'Прямо в точку!'},
      //     ]
      //   })
      // }
      // else {
      //   if (this.stateNode.nodeIsMine) return
      //   this.stateNode.set('voteShow', true)
      // }
      if (this.stateNode.nodeIsMine) return
      this.stateNode.set('voteShow', true)
    }
  }
}
</script>
