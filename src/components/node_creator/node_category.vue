<template lang="pug">
.row.full-width
  k-dialog(ref="nodeCategoryDialog")
    .column.fit.bg-white
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
        span Выберите категории (1-4)
      .col.scroll
        .row.full-width.items-start.content-start
          div(
            v-for="(c, ckey) in categories" :key="ckey" @click="categoryClick(ckey)"
            :style=`{height: '60px'}`
            :class=`{'bg-primary': categoriesLocal.includes(c.type)}`
            ).row.full-width.items-center.q-px-md
            span(:class=`{'text-white': categoriesLocal.includes(c.type)}`) {{ `#${c.name.charAt(0).toUpperCase() + c.name.slice(1)}` }}
  div(:style=`{height: '40px'}`).row.full-width.items-center.q-px-md
    span.text-bold Категория
  .row.full-width.q-px-sm
    div(
      @click="$refs.nodeCategoryDialog.toggle()"
      :style=`{minHeight: '56px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.q-px-sm.bg-grey-3.q-pt-sm
      .col.full-height
        .row.fit.items-center
          div(
            v-for="(c, ci) in categoriesLocal" :key="ci"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.bg-primary.q-pa-xs.q-mr-sm.q-mb-sm
            span.text-white {{ `#${categories[c].name.charAt(0).toUpperCase() + categories[c].name.slice(1)}`  }}
      q-icon(name="keyboard_arrow_down" size="30px" color="grey-7").q-mr-sm
</template>

<script>
export default {
  name: 'nodeCategory',
  props: ['input'],
  data () {
    return {
      categoriesLocal: []
    }
  },
  watch: {
    categoriesLocal: {
      handler (to, from) {
        this.$log('categoriesLocal CHANGED', to)
        this.$emit('input', to)
      }
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    }
  },
  methods: {
    categoryClick (ckey) {
      this.$log('categoryClick', ckey)
      let cFind = this.categoriesLocal.find(cat => (cat === ckey))
      this.$log('cFind', cFind)
      if (cFind) {
        this.$log('DELETE CATEGORY')
        this.categoriesLocal = this.categoriesLocal.filter(cat => (cat !== ckey))
      } else {
        this.$log('ADD CATEGORY')
        if (this.categoriesLocal.length > 3) return
        this.$set(this.categoriesLocal, this.categoriesLocal.length, ckey)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.categoriesLocal = this.input
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
