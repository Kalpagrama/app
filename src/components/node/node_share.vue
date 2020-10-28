<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '60px',
  }`).row.justify-center.items-center.content-center
  kalpa-share(type="node" :item="node" @done="shared")
  //- share count
  div(
    v-if="node.countShares > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countShares }}
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'nodeShare',
  props: ['node'],
  data () {
    return {
    }
  },
  methods: {
    async shared () {
      this.$log('shared')
      let stat = await NodeApi.updateStat(this.node.oid, 'SHARED', null)
      this.$log('shareStart stat', stat)
    }
  },
}
</script>
