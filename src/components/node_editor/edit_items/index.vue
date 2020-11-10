<template lang="pug">
.row.full-width.items-start.content-start
  //- item players
  div(v-if="!item").row.full-width
    div(
      v-for="(item,ii) in node.items" :key="item.id"
      :class=`{
        'q-mb-sm': node.items.length > 1,
      }`
      :style=`{
        borderRadius: '10px'
      }`
      ).row.full-width.b-20
      item-player(
        :item="item"
        :isActive="node.items.length > 1 ? itemActive === ii : true"
        :isOpened="itemOpened === ii"
        :isEditing="node.items.length > 1 ? itemEditing === ii : true")
      div(
        v-if="node.items.length > 1 ? itemEditing !== ii : true"
        ).row.full-width.items-center.content-center.q-pa-xs
        //- div(
          v-if="node.items.length > 1"
          ).row.full-height.items-center.content-center
          //- q-btn(
            @click="itemCover(item)"
            flat no-caps dense
            :color="ii === 0 ? 'green' : 'grey-7'"
            ).full-height {{ ii === 0 ? 'Главное' : 'Наверх' }}
          q-btn(flat round color="grey-7" icon="keyboard_arrow_up" dense @click="itemPrev(item)")
          q-btn(flat round color="grey-7" icon="keyboard_arrow_down" dense @click="itemNext(item)")
        //- .col
        //- q-btn(
          v-if="node.items.length > 1"
          flat dense color="grey-7" icon-right="visibility" no-caps)
          span.text-grey-7.q-mr-sm Show
        //- q-btn(
          v-if="node.items.length > 1"
          round flat dense color="grey-7" icon="edit" @click="itemEditing = ii, itemOpened = ii").q-ml-md
        q-btn(
          v-if="node.items.length === 1"
          round flat dense color="grey-7" icon="delete_outline" @click="itemDelete(item, ii)")
        .col
        q-btn(
          @click="itemOpened === ii ? itemOpened = null : itemOpened = ii"
          round flat dense color="grey-7"
          :icon="itemOpened === ii ? 'keyboard_arrow_up' : 'keyboard_arrow_down'")
        //- q-btn(flat color="green" no-caps icon-right="add" dense @click="$emit('itemAdd', ii)").full-height.q-ml-md Добавить
      div(
        v-if="itemEditing === ii"
        ).row.full-width.items-center.content-center.q-pa-xs
        q-btn(
          v-if="true"
          round flat dense color="grey-7" icon="delete_outline" @click="itemDelete(item, ii)")
        .col
        q-btn(flat color="grey-7" no-caps @click="itemEditing = null" dense) Отмена
        q-btn(color="green" icon-right="check" no-caps dense @click="itemEditing = null").q-px-md.q-ml-md Готово
</template>

<script>
export default {
  name: 'nodeEditor_editItems',
  components: {
    itemPlayer: () => import('./item_player.vue'),
  },
  props: ['node'],
  data () {
    return {
      item: null,
      itemActive: null,
      itemEditing: null,
      itemOpened: null,
    }
  },
  methods: {
    itemCover (item) {
      this.$log('itemCover', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      if (itemIndex >= 0) {
        let itemCopy = JSON.parse(JSON.stringify(item))
        this.$delete(this.node.items, itemIndex)
        this.node.items.unshift(itemCopy)
        this.itemOpened = 0
        this.itemActive = 0
      }
    },
    itemNext (item) {
      this.$log('itemNext', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemNext itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex + 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex + 1])
          this.$set(this.node.items, itemIndex + 1, t)
          this.itemOpened = itemIndex + 1
        }
        else {
          // alert('Nowhere to go!')
        }
      }
    },
    itemPrev (item) {
      this.$log('itemPrev', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemPrev itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex - 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex - 1])
          this.$set(this.node.items, itemIndex - 1, t)
          this.itemOpened = itemIndex - 1
        }
        else {
          // alert('Nowhere to go!')
        }
      }
    },
    itemDuplicate (item) {
      this.$log('itemDuplicate', item)
      let itemInput = JSON.parse(JSON.stringify(item))
      itemInput.id = Date.now().toString()
      this.node.items.push(itemInput)
    },
    itemDelete (item) {
      this.$log('itemDelete', item)
      // ask permission
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      if (itemIndex >= 0) {
        this.$delete(this.node.items, itemIndex)
      }
    },
  },
  mounted () {
    this.$log('mounted')
    if (this.node.items.length > 0) {
      this.itemActive = this.node.items.length - 1
      // this.itemOpened = this.node.items.length - 1
    }
  }
}
</script>
