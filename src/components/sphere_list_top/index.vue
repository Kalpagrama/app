<style lang="sass">
.sphere-item
  &:hover
    background: #888
</style>

<template lang="pug">
.column.fit
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(c,ci) in categories" :key="c.oid" @click="$emit('oid', c.oid)"
        :class=`{
            'bg-grey-7': oid === c.oid
          }`
        :style=`{height: '40px'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer.sphere-item
        span(:style=`{userSelect: 'none', textTransform: 'capitalize'}`).text-white {{'#'+c.name}}
</template>

<script>
export default {
  name: 'sphereListTop',
  props: ['oid'],
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            oid: val.sphere.oid,
            name: val.sphere.name
          })
        }
        return acc
      }, [])
    }
  }
}
</script>
