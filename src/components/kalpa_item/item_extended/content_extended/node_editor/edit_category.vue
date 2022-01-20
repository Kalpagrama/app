<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row
  q-btn(
    flat color="white" no-caps icon-right="keyboard_arrow_down" align="between"
    ).full-width
    span.text-bold.text-grey-5 {{ categoryLabel }}
  //- TODO styling the select component... maybe the fallback to native from quasar
  select(
    ref="categoryInput"
    @change="categoryChanged"
    :style=`{
      position: 'absolute', zIndex: 100,
      opacity: 0
    }`
    ).fit
    option(disabled selected value) -- {{$t('Выберите категорию')}} --
    option(
      v-for="(c,ci) in categories" :key="c.value"
      :value="c.value"
      @click="categorySet(c,ci)"
      )
      span.text-grey-5 {{ c.label }}
</template>

<script>
export default {
  name: 'editCategory',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    categories () {
      return this.$store.getters.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    },
    categoryLabel () {
      if (this.node.category) {
        let name = this.categories.find(c => c.value === this.node.category).label
        return `${this.$t('Category - ')} ${name}`
      }
      else {
        return this.$t('Выберите категорию')
      }
    },
  },
  methods: {
    async categoryChanged (e) {
      this.$log('categoryChanged', e)
      await this.categorySet({value: e.target.value})
    },
    async categorySet (c) {
      this.$logT('categorySet', c)
      this.node.category = c.value
      // this.$set_deprecated(this.node, 'category', c.value)
      await this.$rxdb.updateCategoryOrder(c.value)
    },
  }
}
</script>
