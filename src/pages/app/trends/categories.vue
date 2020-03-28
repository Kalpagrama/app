<template lang="pug">
.column.fit.bg-grey-9
  div(:style=`{height: '60px'}`).row.full-width.items-center.justify-center
    span.text-white.text-bold Choose category
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md
      div(
        v-for="(c,ci) in categoriesFiltered" :key="ci"
        v-if="c.id !== 'ALL'"
        :style=`{height: '45px'}`
        ).row.full-width.items-center.content-center.justify-center.q-px-md
        q-btn(
          no-caps
          :flat="c.id !== $route.params.category"
          :color="c.id === $route.params.category ? 'green' : 'grey-9'"
          :to="'/trends/'+c.id"
          :style=`{borderRadius: '10px', textTransform: 'capitalize'}`)
          span.text-white {{c.name}}
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
