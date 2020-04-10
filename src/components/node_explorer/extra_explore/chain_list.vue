<template lang="pug">
.col.full-width.scroll
  div(
    :style=`{paddingBottom: '100px'}`
    ).row.full-width.items-start.content-start.q-pa-xs
    chain-list-item(
      v-for="(c,ci) in chains" :key="ci" :index="ci" :chain="c" :nodeExplore="node")
</template>

<script>
import chainListItem from './chain_list_item'

export default {
  name: 'nodeExplorer_extraExplore_chainList',
  components: {chainListItem},
  props: ['node', 'chains'],
  data () {
    return {
    }
  }
}
</script>
