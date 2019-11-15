<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    div(v-if="false" :style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="primary" icon="menu")
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Категории
  //- body
  .col.scroll.full-width
    .row.full-width.items-start
      div(
        v-for="(c,ci) in categories" :key="ci" @click="categoryClick(c, ci)"
        :style=`{height: '60px'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer.hr
        span {{ `#${c.name.charAt(0).toUpperCase() + c.name.slice(1)}` }}
</template>
<script>
export default {
  name: 'categories',
  components: {},
  data () {
    return {
      category: undefined
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.category) {
          this.category = to.params.category
        } else {
          this.$router.push({params: {category: this.categories[Object.keys(this.categories)[0]].type}})
        }
      }
    }
  },
  computed: {
    sphereOid () {
      if (this.categories[this.category]) return this.categories[this.category].sphere.oid
      else return false
    },
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    }
  },
  methods: {
    async categoryClick (c, ci) {
      this.$log('categoryClick', c, ci)
      await this.$wait(200)
      this.$router.push({params: {category: c.type}})
    }
  },
}
</script>
