<style lang="sass">
.flip-list-move
  transition: transform 1s
</style>

<template lang="pug">
.column.fit
  .row.full-width
    slot(name="header")
  .col.full-width.q-pa-sm
    div(:style=`{borderRadius: '10px'}`).row.fit.b-70
</template>

<script>
import editInfoItem from './edit_info_item'

export default {
  name: 'nodeEditor-editInfo',
  components: {editInfoItem},
  data () {
    return {
      items: [
        {oid: '1', name: 'Mike'},
        {oid: '2', name: 'Bob'},
        {oid: '3', name: 'John'},
        {oid: '4', name: 'Rob'}
      ]
    }
  },
  methods: {
    shuffle () {
      this.$log('shuffle')
      this.items.sort(() => Math.random() - 0.5)
    },
    nodeDelete () {
      this.$log('nodeDelete')
    }
  }
}
</script>
