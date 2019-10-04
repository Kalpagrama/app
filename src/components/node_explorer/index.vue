<template lang="pug">
.row.full-width.window-height
  div(:style=`{maxWidth: isDesktop ? '500px' : '100%'}`).col.full-height
    q-tab-panels(ref="kpanels" v-model="tab" :swipeable="!isDesktop" animated keep-alive :style=`{background: 'none'}`).fit
      //- node on the left
      q-tab-panel(name="node" :style=`{padding: '0px', background: 'none', maxWidth: '100%'}`)
        .column.fit
          //- div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm.bg-grey-1
          //-   .col
          //-   q-btn(flat style=`width: 40px; height: 40px` color="grey-9" icon="more_vert")
          .col.full-width.scroll.bg-grey-2
            div(:style=`{position: 'relative'}`).row.full-width.justify-center.items-start.content-start.q-px-md
              node(v-if="node" :node="node" :needFull="true" :index="0" @nodeFull="nodeFullLoaded" :active="true"
                :style=`{borderRadius: '10px', maxWidth: '500px', marginBottom: '200px'}`).bg-white.q-mt-md
      //- fragments
      q-tab-panel(name="fragments" :style=`{padding: '0px'}` v-if="!isDesktop")
        //- nodes(v-if="nodeFull" :node="node" :nodeFull="nodeFull" :needFull="true" :nodes="nodes" :active="active")
  //- desktop view
  div(v-if="isDesktop").col.full-height.bg-grey-4
    //- nodes(v-if="nodeFull" :node="node" :nodeFull="nodeFull" :nodes="nodes")
</template>

<script>
import node from 'components/node'
import nodes from './nodes'
// TODO: cant click in mobile mode...
// TODO: on hover event on node fragment
// TODO: fragment menu? in masonry
// TODO: reuse node component?
// TODO: filter in desktop mode nodes width fragments...
// TODO: how to navigate withing top and bottom fragments?
// TODO: how to navigate back?
// TODO: clicking on the same node route adress route doesnt goes to node tab...
export default {
  name: 'nodeExplorer',
  components: {node, nodes},
  data () {
    return {
      tab: 'node',
      node: null,
      needFull: false,
      nodeFull: null,
      active: false,
      nodes: [[], []],
      nodesCurrent: [null, null]
    }
  },
  computed: {
    isDesktop () {
      return this.$q.screen.width > 850
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          this.tab = 'node'
          // this.node = null
          this.active = false
          this.node = await this.nodeLoad(to.params.oid)
          this.needFull = false
          await this.$wait(100)
          this.needFull = true
        }
      }
    },
    'tab': {
      async handler (to, from) {
        this.$log('tab CHANGED', to)
        if (to === 'node') {
          this.active = false
          await this.$wait(100)
          this.active = true
        }
      }
    }
  },
  methods: {
    fragmentInput (f) {
      let oid = f.content.oid
      let points = f.relativePoints
      points.map(p => (delete p['__typename']))
      let scale = f.relativeScale
      return {oid, relativePoints: points, relativeScale: scale}
    },
    async fragmentNodes (fragment) {
      this.$log('fragmentNodes start', fragment)
      let { data: { sphereNodes } } = await this.$apollo.query({
        query: gql`
          query fragmentTopNodes($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}, sortStrategy: HOT) {
              items {
                oid
                type
                name
              }
            }
          }
        `,
        variables: {
          oid: fragment.oid
        }
      })
      this.$log('fragmentNodes done', sphereNodes)
      // return fragmentTopNodes
      // return fragmentTopNodes.map(n => n.objectShort)
      // return sphereNodes.items.map(n => {
      //   return {fragmentsPoints: n.fragments, ...n.objectShort}
      // })
      return sphereNodes.items
    },
    async nodesLoad () {
      this.$log('nodesLoad start')
      let nodes = [
        await this.fragmentNodes(this.fragmentInput(this.nodeFull.fragments[0])),
        await this.fragmentNodes(this.fragmentInput(this.nodeFull.fragments[1]))
      ]
      this.$log('nodesLoad done', nodes)
      return nodes
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      // this.$q.notify('nodeClick')
      this.$router.push(`/app/node/${n.oid}`)
    },
    async nodeFullLoaded (n) {
      this.$log('nodeFullLoaded', n)
      this.nodeFull = n
      this.nodes = await this.nodesLoad()
      this.nodesCurrent = [this.nodes[0][0]['oid'], this.nodes[1][0]['oid']]
      this.active = true
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let { data: { objectList: [node] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesPropsExplorer($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              createdAt
              thumbUrl(preferWidth: 600)
            }
          }
        `,
        variables: {
          oid: oid
        },
        fetchPolicy: 'cache-first'
      })
      this.$log('nodeLoad done', node.name)
      return node
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

<style lang="stylus">
</style>
