<template lang="pug">
.row.fit
  div(:style=`{maxWidth: isDesktop ? '500px' : '100%'}`).col.full-height
    q-tab-panels(ref="kpanels" v-model="tab" :swipeable="!isDesktop" animated keep-alive :style=`{background: 'none'}`).fit
      //- spheres
      q-tab-panel(name="sphere" :style=`{padding: '0px', background: 'none'}`).column.fit
        div(:style=`{height: '60px'}`).row.full-width.items-center.scroll.q-pr-sm
          .col
            .row.fit.scroll
              h4(:style=`{whiteSpace: 'nowrap'}`).q-pa-xs.q-ma-xs {{`#${sphere.name}`}}
          q-btn(
            v-if="!isDesktop"
            icon-right="keyboard_arrow_right" no-caps flat dense color="grey-9"
            @click="$refs.kpanels.goTo('nodes')").row.items-center {{nodes.length}} nodes
        div(v-if="false" :style=`{height: '40px'}`).row.full-width.justify-end.q-px-sm
          //- span sphere actions
          q-btn(round flat dense color="grey-9" icon="search")
          q-btn(round flat dense color="grey-9" icon="more_vert")
        //- spheres
        .col.scroll
          div.row.full-width.q-px-sm.q-pt-md
            div(v-for="(s, si) in spheres" :key="s.oid" @click="sphereClick(s, si)"
              :style=`{borderRadius: '4px'}`
              ).bg-grey-5.q-pa-xs.q-mr-sm.q-mb-sm.cursor-pointer.ksphere
              span(:style=`{whiteSpace: 'nowrap'}`) {{`#${s.name}` | cut(40)}}
      //- nodes
      q-tab-panel(name="nodes" :style=`{padding: '0px'}` v-if="!isDesktop").column.fit
        div(:style=`{height: '50px'}`).row.full-width.items-center.justify-between.bg-grey-4.q-pl-sm
          q-btn(v-if="!isDesktop" dense flat icon="keyboard_arrow_left" color="grey-9" no-caps @click="$refs.kpanels.goTo('sphere')")
            span {{spheres.length}} spheres
        .col.scroll.bg-grey-4
          .row.full-width.justify-center
            node-masonry(:nodes="$nodesDistinct(nodes)" @nodeClick="nodeClick").full-width.justify-center
  //- desktop
  div(v-if="isDesktop").col.full-height.bg-grey-4
    .column.fit
      div(body-scroll-lock-ignore).col.scroll.q-pt-md
        node-masonry(:nodes="$nodesDistinct(nodes)" @nodeClick="nodeClick")
</template>

<script>
// TODO: hide scroll class
// TODO: node name fontSize dynamic depends on what??
import nodeMasonry from 'components/node_masonry'

export default {
  name: 'sphereExplorer',
  components: {nodeMasonry},
  props: ['sphere'],
  data () {
    return {
      tab: 'sphere',
      spheres: [],
      nodes: []
    }
  },
  computed: {
    isDesktop () {
      return this.$q.screen.width > 850
    }
  },
  watch: {
    sphere: {
      immediate: true,
      async handler (to, from) {
        this.spheres = await this.spheresLoad(to.oid)
        this.nodes = await this.nodesLoad(to.oid)
      }
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$router.push(`/app/node/${n.oid}`)
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.$router.push(`/app/sphere/${s.oid}`)
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheres ($oid: OID!){
            sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}) {
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
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start', oid)
      let {data: {sphereNodes}} = await this.$apollo.query({
        query: gql`
          query sphereNodes($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}) {
              totalCount
              items {
                oid
                type
                thumbUrl (preferWidth: 600)
                createdAt
                name
              }
              nextPageToken
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodesLoad done', sphereNodes)
      return sphereNodes.items
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
  background: red !important
}
</style>
