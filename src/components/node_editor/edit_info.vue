<style lang="sass">
.flip-list-move
  transition: transform 1s
</style>

<template lang="pug">
.column.fit
  .row.full-width.justify-center
    div(:style=`{maxWidth: '400px'}`).row.full-width.q-px-sm
      //- span.text-white edit info
      q-btn(push color="red" no-caps @click="shuffle()" icon-right="casino").full-width
        span.text-white.text-bold.q-mr-md Shuffle
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '400px'}`).row.full-width.items-center.content-center.content-start.q-pa-sm
        transition-group(
          name="flip-list"
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut").full-width
          div(
            v-for="(i,ii) in items" :key="i.oid"
            ).row.full-width.q-mb-md
            edit-info-item(:item="i" :index="ii")
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
