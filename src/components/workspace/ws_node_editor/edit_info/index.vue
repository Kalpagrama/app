<template lang="pug">
.column.fit
  .col.full-width.scroll.q-px-sm
    div(
      :style=`{
        borderRadius: '10px',
        overflow: 'hidden'
      }`).row.full-width.items-start.content-start.q-pa-sm.b-50
      .row.full-width.q-py-md.q-px-sm
        span.text-white.text-bold.q-mr-sm Stage:
        span.text-white {{ node.stage }}
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
