<template lang="pug">
.row.full-width
  //- header
  div(
    v-if="sphere"
    :style=`{minHeight: '70px'}`).row.full-width.items-center.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      h6(:style=`{}`).q-pa-xs.q-ma-xs {{`${sphere.name}`}}
  //- spheres
  div.row.full-width.justify-center.q-px-md
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      div(v-for="(s, si) in spheres" v-if="si < 5" :key="s.oid" @click="sphereClick(s, si)"
        :style=`{borderRadius: '10px'}`
        ).bg-grey-3.q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer.ksphere
        span(:style=`{whiteSpace: 'nowrap'}`) {{`${s.name}` | cut(50)}}
  //- body nodes
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      node-loader(v-if="sphereOid" ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
        template(v-slot:default=`{nodes, fetchingMore}`)
          node-list(:nodes="nodes")
</template>

<script>
// TODO: horizontal scroll of sphereSpheres
export default {
  name: 'sphereExplorer',
  props: [],
  data () {
    return {
      sphere: null,
      spheres: [],
      query: gql`
        query nodesLoad($oid: OID!) {
          sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}, sortStrategy: HOT) {
            items {
              oid
              type
              name
              createdAt
              thumbUrl(preferWidth: 600)
              meta {
                ...on MetaNode {
                  layout
                  fragments { width height thumbUrl(preferWidth: 600) }
                }
              }
            }
            count
            totalCount
            nextPageToken
          }
        }
      `
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    variables () {
      return {
        oid: this.sphereOid
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.sphere = await this.sphereLoad(to.params.oid)
          this.spheres = await this.spheresLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.$router.push(`/sphere/${s.oid}`)
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, fragmentName: 'sphereFragment', priority: 0 })
      this.$log('sphereLoad done', sphere)
      return sphere
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheresSphereExplorer ($oid: OID!){
            sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
              items {
                oid
                name
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('spheresLoad done', spheres)
      return spheres
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

<style lang="stylus" scoped>
.ksphere:hover {
  background: #7d389e !important;
  color: white !important;
}
</style>
