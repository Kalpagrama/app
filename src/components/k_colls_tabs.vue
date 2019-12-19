<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.scroll.q-px-sm
  .row.no-wrap
    div(
      v-for="(c,ci) in colls" :key="ci" @click="$emit('coll', c.id)"
      :style=`{height: '34px', borderRadius: '17px'}`
      ).row.items-center.justify-center.q-px-md.bg-grey-2.q-mr-sm.cursor-pointer
      span(:style=`{color: coll === c.id ? 'red' : 'black', whiteSpace: 'nowrap'}`) {{ c.name }}
</template>

<script>
export default {
  name: 'kCollsTabs',
  props: ['coll', 'colls', 'scrollLeft'],
  data () {
    return {
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
