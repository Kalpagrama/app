<template lang="pug">
.column.fit
  .col.full-width.scroll.q-px-sm
    div(
      :style=`{
        borderRadius: '10px',
        overflow: 'hidden'
      }`).row.full-width.items-start.content-start.q-pa-md.b-50
      .row.full-width.q-py-md
        .row.full-width.q-pa-sm
          span.text-white.text-bold Details
        .row.full-width.q-px-sm
          span.text-white.text-bold.q-mr-sm Stage:
          span.text-white {{ node.stage }}
        .row.full-width.q-px-sm
          span.text-white.text-bold.q-mr-sm Category:
          span.text-white {{ node.category }}
        .row.full-width.q-px-sm
          span.text-white.text-bold.q-mr-sm Items:
          span.text-white {{ node.items.length }}
        .row.full-width.q-px-sm
          span.text-white.text-bold.q-mr-sm Spheres:
          span.text-white {{ node.spheres.length }}
      .row.full-width.q-py-md
        .row.full-width.q-pa-sm
          span.text-white.text-bold Danger zone
        .row.full-width.q-px-sm
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
      await this.$rxdb.remove(this.node.id)
      this.$emit('close')
    }
  }
}
</script>
