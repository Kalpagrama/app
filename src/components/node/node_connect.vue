<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '60px',}`).row.full-height.items-center.content-center.justify-center
  //- position="bottom"
  q-dialog(
    v-model="nodeConnectOpened"
    transition-show="none"
    transition-hide="none"
    @before-show="nodeActive = false, $store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="nodeActive = true, $store.commit('ui/stateSet', ['showMobileNavigation', true])")
    //- TODO: width, height of this dialog...
    div(
      :style=`{
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        minHeight: $q.screen.gt.sm ? $q.screen.height/2+'px' : $q.screen.height+'px',
        borderRadius: '10px',
      }`
      ).row.full-width.items-start.content-start.b-30
      kalpa-connect(
        v-if="node"
        :oid="node.oid"
        @close="nodeConnectOpened = false")
        div(
          :style=`{
            borderRadius: '10px'
          }`
          ).row.full-width.b-40
          img(
            draggable="false"
            :src="node.thumbUrl"
            :style=`{
              height: '80px',
              borderRadius: '10px', overflow: 'hidden',
            }`)
          .col
            .row.fit.items-start.content-start.q-pa-md
              span.text-white.text-bold {{ node.name }}
  slot(name="action" :start="connectStart")
  q-btn(
    v-if="!$scopedSlots.action"
    @click="connectStart()"
    round flat color="green").shaking
    q-icon(name="link" size="30px" color="grey-9")
  //- joints count
  div(
    v-if="node.countJoints > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countJoints }}
</template>

<script>
export default {
  name: 'nodeConnect',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      nodeConnectOpened: false
    }
  },
  methods: {
    connectStart () {
      this.$log('connectStart')
      this.nodeConnectOpened = true
      // this.$router.push('/workspace/joint/new?oid='+node.oid)
    }
  }
}
</script>
