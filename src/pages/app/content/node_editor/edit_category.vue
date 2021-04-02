<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row
  q-btn(
    flat color="white" no-caps icon-right="keyboard_arrow_down" align="between"
    ).full-width
    span {{ categoryLabel }}
  //- TODO styling the select component... maybe the fallback to native from quasar
  select(
    v-if="true || $q.platform.is.mobile"
    ref="categoryInput"
    :name="$t('Pick category')"
    @change="categoryChanged"
    :style=`{
      position: 'absolute', zIndex: 100,
      opacity: 0
    }`
    ).fit
    option(:value="null") {{$t('Nothing')}}
    option(
      v-for="(c,ci) in categories" :key="ci"
      :value="c.value"
      @click="categorySet(c,ci)"
      ) {{ c.label }}
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
        return this.$t('Pick category')
      }
    },
  },
  methods: {
    categoryChanged (e) {
      this.$log('categoryChanged', e)
      this.categorySet({value: e.target.value})
    },
    categorySet (c) {
      this.$log('categorySet', c)
      // this.node.category = c.value
      this.$set(this.node, 'category', c.value)
    },
  }
}
</script>
