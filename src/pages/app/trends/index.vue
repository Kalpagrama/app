<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-header(
    reveal
    :style=`{zIndex: 200, paddingLeft: $q.screen.xs ? '0px' : '60px'}`).row.full-width.justify-center.bg-grey-9
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`).row.full-width.items-center
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="green" icon="whatshot")
      span.text-green.text-bold Trends
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
        textTransform: 'capitalize', whiteSpace: 'nowrap'}`
      ).row.full-width.scroll
        //- .row.no-wrap
        kalpa-buttons(:value="categoriesFiltered" :id="$route.params.category" idKey="id" @id="$router.push({params: {category: $event}})").no-wrap
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
      // category: 'FUN'
    }
  },
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
    },
    sphereOid () {
      // return this.categories[this.category].sphere.oid
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
        if (!to) this.$router.replace({params: {category: 'FUN'}})
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
