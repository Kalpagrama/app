<template lang="pug">
.row.full-width
  div(:style=`{height: '40px'}`).row.full-width.q-px-sm
    span.text-white.text-bold Choose categories
  .row.full-width
    span(
      v-for="(c,ci) in categories" @click="categoryClick(c, ci)"
      v-if="c.type !== 'ALL'"
      :class=`{
        'bg-grey-9': !types.includes(c.type),
        'bg-green': types.includes(c.type),
        'text-white': true
      }`
      :style=`{
        fontSize: '20px',
        textTransform: 'capitalize',
        userSelect: 'none',
        borderRadius: '10px',
        overflow: 'hidden'
      }`
      ).q-pa-sm.q-mr-md.q-mb-sm.cursor-pointer {{ c.name }}
</template>

<script>
export default {
  name: 'pageAppWelcome',
  data () {
    return {
      nodeCategories: [],
      types: []
    }
  },
  computed: {
    categories () {
      return this.nodeCategories
    }
  },
  watch: {
    spheres: {
      handler (to, from) {
        this.$log('spheres CHAGNED', to)
        this.$emit('types', to)
      }
    }
  },
  methods: {
    categoryClick (c, ci) {
      this.$log('categoryClick', c, ci)
      let i = this.types.findIndex(t => t === c.type)
      if (i >= 0) this.types = this.types.filter(t => t !== c.type)
      else this.types.push(c.type)
    }
  },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get('nodeCategories')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
