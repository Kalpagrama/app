<template lang="pug">
q-layout(view="hHh lpR fFf" :style=`{height: $q.screen.height+'px'}`)
  q-header(reveal).bg-grey-8
    div(
      v-if="sphere"
      :style=`{height: '60px', paddingLeft: $q.screen.gt.xs ? '70px' : '0px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: '750px'}`).row.fit.items-center.content-center.q-px-md
        span {{ sphere.name }}
        .col
        q-btn(round flat color="white" icon="more_vert")
  q-page-conainter.row.full-width.justify-center.items-start.content-start.bg-grey-9
    kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables")
      template(v-slot:items=`{items}`)
        node-list(:nodes="items" :style=`{maxWidth: '750px'}`)
</template>

<script>
export default {
  name: 'pageAppSphere',
  components: {},
  data () {
    return {
      sphere: null
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
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
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.page = 'sphere'
        if (to.params.oid) {
          this.$log('$route CHANGED', to)
          this.sphere = await this.sphereLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('sphereLoad done', sphere)
      return sphere
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
