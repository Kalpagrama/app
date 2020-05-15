<style lang="sass">
.flip-list-move
  transition: transform 1s
</style>

<template lang="pug">
.column.fit
  .col.full-width.q-px-sm.q-pb-sm
    div(:style=`{borderRadius: '10px'}`).row.fit.b-50
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
