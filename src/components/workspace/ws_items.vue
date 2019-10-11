<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.q-px-sm.q-pt-sm
  k-menu-popup(ref="kPopup" :name="item ? item.name : ''" :actions="actions" @action="itemAction")
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
    itemAction ({id}) {
      this.$log('itemAction', id)
      switch (id) {
        case 'use': {
          this.$emit('item', this.item)
          break
        }
        case 'edit': {
          break
        }
        case 'delete': {
          break
        }
      }
      this.$set(this, 'item', null)
    },
    itemClick (i, ii) {
      this.$log('itemClick', i)
      this.$set(this, 'item', i)
      switch (i.__typename) {
        case 'WSBookmark': {
          this.$log('WSBookmark')
          break
        }
        case 'WSContent': {
          this.$log('WSContent')
          break
        }
        case 'WSFragment': {
          this.$log('WSFragment')
          break
        }
        case 'WSDraft': {
          this.$log('WSDraft')
          break
        }
        case 'WSTag': {
          this.$log('WSTag')
          break
        }
      }
      this.$refs.kPopup.toggle()
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
