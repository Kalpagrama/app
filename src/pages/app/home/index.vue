<template lang="pug">
q-layout(view="hHh lpR fFf" :style=`{height: $q.screen.height+'px'}`)
  q-page-conainter.row.full-width.justify-center.items-start.content-start.bg-grey-9
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items" :style=`{maxWidth: '750px'}`)
</template>

<script>
export default {
  name: 'pageAppHome',
  props: [],
  data () {
    return {
      width: 0
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
      return this.categories.FUN.sphere.oid
      // if (this.$route.params.category) return this.categories.FUN.sphere.oid
      // else return false
      // return this.categories.FUN.sphere.oid
      // else return false
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  watch: {
    // '$route.params.category': {
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('$route.params.category')
    //     // TODO set first category?
    //     if (!to) this.$router.push({params: {category: 'FUN'}})
    //   }
    // }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    // TODO document set body color
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
