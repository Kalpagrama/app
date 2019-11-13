<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.q-px-sm.q-pt-sm
  k-dialog-bottom(ref="itemDialog" mode="actions" :options="itemDialogOptions" @action="itemAction")
  div(
    v-for="(i, ii) in items" :key="ii" @click="itemClick(i, ii)"
    :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.items-center.bg-grey-2.q-mb-sm
    img(
      :src="i.thumbUrl"
      :style=`{height: '60px', borderRadius: '10px', oveflow: 'hidden', width: '100px', objectFit: 'contain'}`).bg-black
    .col.full-height
      .row.fit.items-center.q-px-sm
        span {{ i.name || i.uid | cut(40) }}
</template>

<script>
export default {
  name: 'wsItems',
  props: ['search', 'type'],
  data () {
    return {
      // search: '',
      actions: [
        {id: 'use', name: 'Использовать', class: ['text-bold', 'text-primary']},
        {id: 'edit', name: 'Изменить'},
        {id: 'delete', name: 'Удалить'}
      ],
      item: null
    }
  },
  computed: {
    itemDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Edit',
        actions: {
          delete: {name: 'Delete', color: 'red'}
        }
      }
    },
    WSItems () {
      // return this.$store.getters['workspace/WSItems']
      return this.$store.state.workspace.workspace.fragments
    },
    items () {
      // if (this.search.length === 0) return this.tags
      // else {
      //   return this.WSItems.filter(t => {
      //     let pattern = new RegExp(this.search, 'g')
      //     return t.name.match(pattern)
      //   })
      // }
      return this.WSItems.filter(t => {
        let pattern = new RegExp(this.search, 'g')
        return t.name.match(pattern)
      })
    },
    types () {
      return this.$store.state.workspace.types
    }
  },
  methods: {
    itemAction (e) {
      this.$log('itemAction', e)
      switch (e) {
        case 'delete': {
          this.$log('delete')
          break
        }
        case 'confirm': {
          this.$log('confirm')
          break
        }
      }
    },
    itemClick (i, ii) {
      this.$log('itemClick', i)
      this.$refs.itemDialog.show()
    }
  }
}
</script>
