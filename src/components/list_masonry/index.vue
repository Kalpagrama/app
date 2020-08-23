<template lang="pug">
.row.full-width.items-start.content-start
  masonry(
    :cols="2"
    :gutter="{default: 10}"
    :style=`{position: 'relative', width: 'calc(100% + 10px)'}`)
    div(
      v-for="(i, ii) in itemsFiltered" :key="i[itemKey]"
      :class=`{
      }`
      :style=`{
        position: 'relative',
        ...itemStyles,
      }`
      ).row.full-width.items-start.content-start.q-mb-sm
      slot(name="item" :item="i")
</template>

<script>
export default {
  name: 'listMasonry',
  props: {
    itemKey: {type: String, default () { return 'oid' }},
    items: {type: Array, default () { return [] }, required: true},
    itemsHidden: {type: Array, default () { return [] }},
    itemStyles: {type: Object, default () { return {} }},
  },
  data () {
    return {
    }
  },
  computed: {
    itemsFiltered () {
      if (this.itemsHidden.lenght === 0) return this.items
      return this.items.filter(i => !this.itemsHidden.includes(i[this.itemKey]))
    },
  },
  watch: {
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
