<style lang="sass">
.flip-list-move
  transition: transform 1s
</style>

<template lang="pug">
.column.fit
  .row.full-width
    slot(name="header")
  .col.full-width.q-pa-sm
    .row.full-width.items-start.content-start
      q-btn(color="red" no-caps @click="nodeDelete()") Delete node
</template>

<script>
export default {
  name: 'nodeEditor-editInfo',
  components: {},
  props: ['node'],
  data () {
    return {
    }
  },
  methods: {
    async nodeDelete () {
      this.$log('nodeDelete', this.node.id)
      if (!confirm('Delete node ?!')) return
      await this.$rxdb.deleteItem(this.node.id)
      this.$emit('close')
    }
  }
}
</script>
