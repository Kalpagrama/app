<template lang="pug">
.column.full-width.bg-grey-9
  //- .col.full-width.scroll
  .row.full-width.items-start.content-start
    router-link(
      v-for="(c,ci) in categoriesFiltered" :key="ci" :to="'/trends/'+c.id"
      v-if="c.id !== 'ALL'"
      :class=`{
          'bg-grey-7': $route.params.category === c.id
        }`
      :style=`{height: '40px'}`
      ).row.full-width.items-center.q-px-md
      span(:style=`{textTransform: 'capitalize'}`).text-white {{'#'+c.name}}
</template>

<script>
export default {
  name: 'PageAppTrends--Categories',
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    categoriesFiltered () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc.push({id: val.type, name: val.name})
        return acc
      }, [])
    }
  }
}
</script>
