<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-header(:style=`{zIndex: 200, paddingLeft: $q.screen.xs ? '0px' : '60px'}`).row.full-width.justify-center.bg-grey-9
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`).row.full-width.items-center
      span.text-green.text-bold Trends
  q-page-conainter.row.full-width.justify-center.items-start.content-start.bg-grey-10
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items" :style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`)
</template>

<script>
export default {
  name: 'pageAppTrends',
  props: [],
  data () {
    return {
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    sphereOid () {
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
      // return this.categories.FUN.sphere.oid
      // else return false
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 200 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  watch: {
    '$route.params.category': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.category')
        // TODO set first category?
        if (!to) this.$router.push({params: {category: 'FUN'}})
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('#eee')
    document.body.style.background = '#eee'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
