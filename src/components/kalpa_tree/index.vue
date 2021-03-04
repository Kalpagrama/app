<template lang="pug">
.row.full-width
  slot
  div(
    :style=`{
      paddingLeft: 4*depth+'px',
    }`
    ).row.full-width
    div(
      v-for="(n,ni) in nodes" :key="ni"
      ).row.full-width
      //- go again...
      kalpa-tree(
        v-if="nodesShow(n)"
        :nodes="n[nodesKey]"
        :nodesKey="nodesKey"
        :nodesShow="nodesShow"
        :depth="depth+1")
        span.text-white {{ n.name }}
      //- this is file
      div(
        v-else
        ).row.full-width.q-px-xs
        span.text-white {{ n.name }}
</template>

<script>
export default {
  name: 'kalpaTree',
  props: {
    nodesKey: {
      type: String,
    },
    nodesShow: {
      type: Function,
    },
    nodes: {
      type: Array
    },
    depth: {
      type: Number,
      default: 0,
    },
  }
}
</script>
