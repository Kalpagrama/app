<template lang="pug">
div(:style=`{height: '40px'}`).row.full-width.items-center.justify-end.q-px-xs
  //- share
  q-btn(round flat color="grey-9" icon="share" @click="nodeShare()")
  .col
  //- rate
  div(v-if="nodeFull && nodeFull.rateUser").q-mr-sm
    small {{Math.ceil(nodeFull.rateUser*100)}}/
    span(:style=`{fontSize: '15px'}`).text-bold {{Math.ceil(nodeFull.rate*100)}}
  //- blur
  q-btn(color="grey-9" round flat @click="nodeBlur()")
    q-icon(name="blur_on" size="34px")
</template>

<script>
export default {
  name: 'nodeActions',
  components: {},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active'],
  methods: {
    nodeBlur () {
      this.$log('nodeBlur')
      this.$store.commit('node/stateSet', ['node', this.node])
      this.$store.commit('node/stateSet', ['nodeFull', this.nodeFull])
      this.$store.commit('ui/stateSet', ['nodeRateDialogOpened', true])
    },
    nodeShare () {
      this.$log('nodeShare')
      this.$store.commit('ui/stateSet', ['nodeShareDialogOpened', true])
    }
  }
}
</script>
