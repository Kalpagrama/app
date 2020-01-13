<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).column.full-width.bg-grey-4
  .col
    sphere-explorer(v-if="page === 'sphere' && sphere" :sphere="sphere" noHeader)
    div(v-else).row.fit.q-pa-md
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-start.content-start.bg-white.q-pa-sm
        h4 {{ pages[page].name }}
</template>

<script>
import sphereExplorer from 'components/sphere_explorer'

export default {
  name: 'page_app_sphere',
  components: {sphereExplorer},
  data () {
    return {
      sphere: null,
      page: undefined
    }
  },
  computed: {
    pages () {
      return {
        sphere: {name: this.sphere ? `#${this.sphere.name}` : ''},
        settings: {name: 'Настройки'}
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
          this.$logD('$route CHANGED', to)
          this.sphere = await this.sphereLoad(to.params.oid)
        } else {
          this.$router.push(`/app/sphere/${this.$store.getters.currUser.oid}`)
        }
      }
    }
  },
  methods: {
    async sphereLoad (oid) {
      this.$logD('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, fragmentName: 'sphereFragment', priority: 0 })
      // let { data: { objectList: [sphere] } } = await this.$apollo.query({
      //   query: gql`
      //     query sphereLoad ($oid: OID!) {
      //       objectList (oids: [$oid]) { oid type name }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      this.$logD('sphereLoad done', sphere)
      return sphere
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
