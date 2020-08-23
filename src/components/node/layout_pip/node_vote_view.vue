<template lang="pug">
div(
  :class=`{
    'q-pl-xs': nodeFull && nodeFull.rateUser,
  }`
  :style=`{
    position: 'relative',
    borderRadius: 20+'px',
    overflow: 'hidden',
  }`
  ).row.items-center.content-center.b-80
  //- rateUser
  div(
    v-if="nodeFull && nodeFull.rateUser"
    ).row.full-height.items-center.content-center
    user-avatar(
      v-for="i in 1" :key="i"
      @click.native="$router.push('/user/'+nodeFull.author.oid)"
      :url="$store.getters.currentUser().profile.photoUrl"
      :width="34" :height="34"
      :opacity="0.5 + (0.1*i)"
      :style=`{
        marginRight: '-10px',
        zIndex: 10+i,
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
    push
    color="green"
    :loading="stateNode.voteShow"
    :style=`{
      zIndex: 300,
      //- width: '40px',
      height: '40px',
      borderRadius: '20px'
    }`).row.items-center.content-center
    span(
      v-if="nodeFull"
      :style=`{
        fontSize: '22px', userSelect: 'none',
        userSelect: 'none',
      }`
      ).text-white.text-bold {{ Math.round(nodeFull.rate * 100) }}
      //- .row.full-width.justify-center
    q-icon(
      color="white" name="emoji_people" size="22px").q-mt-xs
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
