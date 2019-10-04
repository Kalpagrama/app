<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  k-menu-popup(ref="kPopup" :name="item ? item.name : ''" :actions="actions" @action="itemAction")
  //- header
  div(:style=`{height: '70px'}`).row.full-width
    div(
      v-if="false"
      :style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
      q-btn(round flat icon="menu" color="primary")
    .col.full-height
      .row.fit.items-center.content-center.q-px-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(v-model="search" filled placeholder="Поиск").full-width
            template(v-slot:append)
              q-btn(round flat dense color="grey-7" icon="filter_list")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(i, ii) in WSItems" :key="ii" @click="itemClick(i, ii)"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.bg-grey-2.q-mb-sm
        img(
          :src="i.thumbUrl"
          :style=`{height: '60px', borderRadius: '10px', oveflow: 'hidden', width: '100px', objectFit: 'contain'}`).bg-black
        .col.full-height
          .row.fit.items-center.q-px-sm
            span {{ i.name || i.uid | cut(40) }}
  //- footer
</template>

<script>
export default {
  name: 'wsItems',
  data () {
    return {
      search: '',
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
