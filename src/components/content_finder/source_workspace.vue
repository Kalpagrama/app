<template lang="pug">
.row.fit
  workspace(@contentClick="contentClick" :inFinder="true" @item="$emit('uploaded', $event.content.oid)")
</template>

<script>
import workspace from 'components/workspace'

// TODO: add mode for workspace finder, and editor
export default {
  name: 'contentFinder__sourceWorkspace',
  props: ['source'],
  components: {workspace},
  data () {
    return {
    }
  },
  methods: {
    contentClick (c, ci) {
      this.$logD('contentClick', c, ci)
      this.$emit('uploaded', c.oid)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
