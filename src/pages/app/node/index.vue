<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.justify-center.bg-grey-4
  div(v-if="false" :style=`{position: 'fixed', zIndex: 10000, right: '0px', top: '40%', width: '200px', color: 'white'}`).row.bg-purple
    small.full-width {{nodesCurrent}}
    small.full-width {{nodes}}
  q-tab-panels(v-model="tab" swipeable animated keep-alive).fit.bg-grey-4
    q-tab-panel(name="top").row.full-width.justify-center
      node-masonry(:nodes="nodes[0]")
    q-tab-panel(name="node").row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: '500px'}`).row.full-width
        node(v-if="node" :index="0" :node="node" @nodeFull="nodeFullLoaded" :width="500" :maxHeight="0.54*$q.screen.height"
          :zIndex="200" :active="active" :needFull="needFull").bg-white
    q-tab-panel(name="bottom").row.full-width.justify-center
      node-masonry(:nodes="nodes[0]")
</template>

<script>
import node from 'components/node'
import nodeMasonry from 'components/node_masonry'

export default {
  name: 'pageApp__Node',
  components: { node, nodeMasonry },
  props: ['width', 'height'],
  data () {
    return {
      node: null,
      needFull: false,
      tab: 'node',
      tabs: [
        {id: 'top'},
        {id: 'node'},
        {id: 'bottom'}
      ],
      active: false,
      nodeFull: null,
      nodesCurrent: [null, null],
      nodes: [[], []]
    }
  },
  computed: {
  },
  watch: {
    'tab': {
      async handler (to, from) {
        this.$log('tab CHANGED', to)
        if (to === 'node') {
          this.active = false
          await this.$wait(100)
          this.active = true
        }
      }
    },
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          this.tab = 'node'
          this.node = null
          this.active = false
          this.node = await this.nodeLoad(to.params.oid)
          this.needFull = false
          await this.$wait(100)
          this.needFull = true
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
      let { data: { fragmentTopNodes } } = await this.$apollo.query({
        query: gql`
          query fragmentTopNodes($fragment: FragmentInput!) {
            fragmentTopNodes(fragment: $fragment) {
              objectShort {
                oid
                type
                name
                createdAt
                thumbUrl(preferWidth: 600)
              }
            }
          }
        `,
        variables: {
          fragment: fragment
        }
      })
      this.$log('fragmentNodes done', fragmentTopNodes)
      return fragmentTopNodes.map(n => n.objectShort)
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
    async nodeFullLoaded (n) {
      this.$log('nodeFullLoaded')
      this.nodeFull = n
      this.nodes = await this.nodesLoad()
      this.nodesCurrent = [this.nodes[0][0]['oid'], this.nodes[1][0]['oid']]
      this.active = true
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let { data: { objectList: [node] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
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

<style lang="stylus" scoped>
</style>
