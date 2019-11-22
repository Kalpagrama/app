<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- background: 'rgba(0,0,0,0.35)'
  div(:style=`{height: '50px'}`).row.full-width.bg-white
    div(v-if="false" :style=`{width: '50px', height: '50px'}`).row.items-center.justify-center
      q-btn(round flat color="primary" icon="menu")
    .col.full-height
      .row.fit.items-center.q-px-lg
        span.text-bold {{ $t('Trends') }}
  div(v-if="false").row.full-width.bg-red
    small {{ category }}
  //- body
  .col.scroll.full-width
    div(:style=`{paddingBottom: '100px'}`).row.full-width.items-start
      //- span {{ categories }}
      div(
        v-for="(c, ckey) in categories" :key="ckey" @click="categoryClick(c, ckey)"
        :style=`{height: '60px'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer
        span(
          :class=`{'bg-accent': ckey === category}`
          :style=`{color: ckey === category ? 'white' : 'black', borderRadius: '4px'}`).q-pa-sm {{ `#${c.name.charAt(0).toUpperCase() + c.name.slice(1)}` }}
</template>

<script>
export default {
  name: 'categories',
  // props: ['category'],
  data () {
    return {
      category: undefined
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        // this.$log('$route CHANGED', to)
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
      // this.$emit('category', c.type)
      // await this.$wait(200)
      this.$router.push({params: {category: c.type}})
      this.$emit('category', c.type)
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
