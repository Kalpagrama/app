<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '50px',
  }`).row.justify-center.items-center.content-center
  kalpa-share(type="node" :item="node" color="grey-9" @done="shared")
  //- share count
  div(
    v-if="node.countShares > 0"
    :style=`{position: 'absolute', zIndex: 10, bottom: '0px',}`).row.full-width.justify-center
    small.text-grey-9 {{ node.countShares }}
</template>

<script>
import { ObjectApi } from 'src/api/object'

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
      let stat = await ObjectApi.updateStat(this.node.oid, 'SHARED', null)
      this.$log('shareStart stat', stat)
    }
  },
}
</script>
