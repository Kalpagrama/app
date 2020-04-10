<template lang="pug">
.row.fit
  composition-editor(
    v-if="node && node.items.length > 0"
    ctx="contentEditor" mode="content" :node="node"
    @cancel="$emit('cancel')")
  div(
    v-else
    ).row.fit.items-center.content-center.justify-center
    span.text-white Add some content
</template>

<script>
export default {
  name: 'contentEditor',
  props: ['node', 'saving'],
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
