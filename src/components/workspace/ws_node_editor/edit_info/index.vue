<template lang="pug">
.column.fit
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      .row.full-width.q-py-md
        span.text-white.text-bold Stage: {{ node.stage }}
      q-btn(color="red" no-caps @click="nodeDelete()") Delete node
</template>

<script>
export default {
  name: 'editInfo',
  props: ['node'],
  data () {
    return {
    }
  },
  methods: {
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!confirm('Delete node ?!')) return
      await this.$rxdb.deleteItem(this.node.id)
      this.$emit('close')
    }
  }
}
</script>
