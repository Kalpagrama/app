<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-header(
    v-if="showNameSticky"
    ).row.full-width.justify-center
    .col.bg-grey-3
    div(:style=`{maxWidth: '500px'}`).row.full-width.q-px-sm
      div(:style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.bg-grey-3.q-pt-sm
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden', }` @click="headerClick()").row.full-width.items-center.justify-center.bg-green
          span(v-if="node").text-bold.text-white.text-center {{ sphere.name }}
    .col.bg-grey-3
      span похожие сферы в ряд
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: '500px'}`)
  q-page-conainter
    .row.full-width.justify-center.items-start.content-start
      .row.full-width.justify-center
        div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start.q-pa-sm
          .row.full-width.items-start.content-start
            node(
              v-if="node"
              ref="neNode"
              :ctx="'inList'"
              :node="node" :nodeFullReady="node"
              :visible="true" :opened="true"
              @previewWidth="previewWidth = $event"
              @previewHeight="previewHeight = $event").bg-white.q-mb-md
      div(
        v-if="true"
        :style=`{marginBottom: '1000px'}`).row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '500px'}`).row.full-width.q-pa-sm
          node-loader(v-if="nodeOid" ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
            template(v-slot:default=`{nodes}`)
              node-list(:nodes="nodes" @nodeClick="nodeClick")
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
                    fragments { width height color thumbUrl(preferWidth: 600) }
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
      this.$logD('sphereClick', s, si)
      this.$router.push(`/sphere/${s.oid}`)
    },
    async spheresLoad (oid) {
      // this.$logD('spheresLoad start', oid)
      let spheres = await this.$store.dispatch('objects/sphereSpheres', oid)
      // let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
      //   query: gql`
      //     query sphereSpheresOld ($oid: OID!){
      //       sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
      //         items {
      //           oid
      //           name
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      // this.$logD('spheresLoad done', spheres)
      return spheres
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

<style lang="stylus" scoped>
.ksphere:hover {
  background: #7d389e !important
  color: white !important
}
</style>
