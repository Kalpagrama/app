<template lang="pug">
.column.fit
  div(
    v-if="true"
    :style=`{height: '50px'}`).row.full-width.text-white.q-px-sm
    small.full-width nodesHighlight: {{nodesHighlight}}
    small.full-width nodeIndex: {{nodeIndex}}
  .col.full-width.scroll
    .row.full-width.justify-center.q-px-xs
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', paddingBottom: '300px'}`).row.full-width.items-start.content-start.q-py-sm
        div(
          v-for="(n,ni) in nodes" :key="n.oid" @click="$emit('nodeMiddle', ni)"
          :class=`{}`
          :style=`{height: '30px', borderRadius: '10px', border: nodesHighlight.includes(ni) ? '2px solid red' : 'none'}`
          ).row.full-width.items-center.content-center.bg-grey-9.q-mb-sm.q-px-md
          span.text-white {{ n.name }}
</template>

<script>
export default {
  name: 'nodeListName',
  props: ['nodes', 'nodeIndex', 'nodesHighlight', 'nodesBan'],
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
