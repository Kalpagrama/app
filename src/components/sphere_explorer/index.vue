<template lang="pug">
k-split(:headerMaxHeight="$q.screen.height/3" :bodyClass="['bg-grey-1', 'q-pt-sm']").bg-white
  template(v-slot:header)
    //- header
    div(v-if="true" :style=`{minHeight: '70px'}`).row.full-width.items-center.scroll.q-px-sm
      h6(:style=`{}`).q-pa-xs.q-ma-xs {{`#${sphere.name}`}}
    //- spheres
    div.row.full-width.q-px-md
      div(v-for="(s, si) in spheres" v-if="si < 5" :key="s.oid" @click="sphereClick(s, si)"
        :style=`{borderRadius: '10px'}`
        ).bg-grey-3.q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer.ksphere
        span(:style=`{whiteSpace: 'nowrap'}`) {{`#${s.name}` | cut(50)}}
  template(v-slot:body)
    node-loader(ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-list(:nodes="items").q-px-md
</template>

<script>
// TODO: horizontal scroll of sphereSpheres
export default {
  name: 'sphereExplorer',
  props: ['sphere', 'noHeader'],
  data () {
    return {
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
                    fragments { uid width height color thumbUrl(preferWidth: 600) }
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
    variables () {
      return {
        oid: this.sphere.oid
      }
    }
  },
  watch: {
    sphere: {
      immediate: true,
      async handler (to, from) {
        this.spheres = await this.spheresLoad(to.oid)
      }
    }
  },
  methods: {
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.$router.push(`/app/sphere/${s.oid}`)
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheresOld ($oid: OID!){
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
  background: #7d389e !important
  color: white !important
}
</style>
