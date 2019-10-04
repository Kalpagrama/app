<template lang="pug">
.row.fit
  //- div(:style=`{width: '76px'}`).row.full-height.gt-sm
  .col.full-height
    div(:style=`{maxWidth: isDesktop ? '500px' : '100%'}`).col.full-height
      q-tab-panels(ref="kpanels" v-model="tab" :swipeable="!isDesktop" animated keep-alive :style=`{background: 'none'}`).fit
        //- spheres
        q-tab-panel(name="sphere" :style=`{padding: '0px', background: 'none'}`)
          .row.fit.q-py-sm
            .column.fit
              //- header
              div(v-if="noHeader" :style=`{minHeight: '60px', borderRadius: '10px'}`).row.full-width.items-center.scroll.q-px-sm.bg-grey-1
                h4(:style=`{}`).q-pa-xs.q-ma-xs {{`#${sphere.name}`}}
              //- tools
              div(v-if="false" :style=`{height: '40px'}`).row.full-width.items-center.justify-end.q-px-sm.bg-grey-1
                q-btn(flat color="grey-9" style=`width: 40px; height: 40px` icon="search")
                q-btn(flat color="grey-9" style=`width: 40px; height: 40px` icon="more_vert")
                q-btn(flat color="grey-9" style=`height: 40px` icon-right="keyboard_arrow_right" no-caps ) {{nodes.length}} nodes
              //- spheres
              div(body-scroll-lock-ignore).col.scroll.full-width
                div.row.full-width.q-px-sm
                  div(v-for="(s, si) in spheres" :key="s.oid" @click="sphereClick(s, si)"
                    :style=`{borderRadius: '10px'}`
                    ).bg-grey-5.q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer.ksphere
                    span(:style=`{whiteSpace: 'nowrap'}`) {{`#${s.name}` | cut(50)}}
              //- nodes btn
              div(v-if="false" style=`position: fixed; bottom: 60px; height: 70px`).row.full-width.items-center.justify-end.q-px-sm
                q-btn(
                  color="primary" icon-right="keyboard_arrow_right" no-caps
                  :style=`{borderRadius: '10px', height: '50px'}`
                  @click="$refs.kpanels.goTo('nodes')").full-width {{nodes.length}} nodes
        //- nodes
        //- q-tab-panel(name="nodes" :style=`{padding: '0px'}` v-if="!isDesktop")
        //-   nodes(:nodes="nodes" @nodeClick="nodeClick")
  //- desktop
  div(v-if="isDesktop").col.full-height.bg-grey-4
    nodes(:nodes="nodes" @nodeClick="nodeClick")
</template>

<script>
// TODO: hide scroll class
// TODO: node name fontSize dynamic depends on what??
import nodeMasonry from 'components/node_masonry'
import nodes from './nodes'

export default {
  name: 'sphereExplorer',
  components: {nodeMasonry, nodes},
  props: ['sphere', 'noHeader'],
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
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start', oid)
      let {data: {sphereNodes}} = await this.$apollo.query({
        query: gql`
          query nodesLoad($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}, sortStrategy: HOT) {
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
  background #7d389e !important
  color white !important
}
</style>
