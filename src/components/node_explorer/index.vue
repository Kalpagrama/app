<template lang="pug">
.row.fit
  div(:style=`{maxWidth: isDesktop ? '600px' : '100%'}`).col.full-height
    q-tab-panels(ref="kpanels" v-model="tab" :swipeable="!isDesktop" animated keep-alive :style=`{background: 'none'}`).fit
      //- top fragment on the left
      q-tab-panel(name="top" :style=`{padding: '0px', background: 'none'}` v-if="!isDesktop").column.fit
        div(:style=`{height: '50px'}`).row.full-width.items-center.justify-between.bg-grey-4.q-px-sm
          span.text-bold.q-ml-xs Ядра на верхний фрагмент
          .col
          q-btn(round flat icon="keyboard_arrow_right" no-caps @click="$refs.kpanels.goTo('node')")
        .col.scroll.bg-grey-4
          .row.full-width.justify-center
            node-masonry(key="top" :nodes="$nodesDistinct(nodes[0])").full-width.justify-center
      //- node in the middle
      q-tab-panel(name="node" :style=`{padding: '0px', background: 'none', maxWidth: '100%'}`)
        .col
          //- div(:class=`{'q-pt-md': isDesktop}`).row.full-width.justify-center.items-start
          div(:style=`{position: 'relative'}`).row.full-width.justify-center.items-start.content-start.q-px-md
            node-css(v-if="node" :node="node" maxHeight='60vh' :needFull="true" :index="0" @nodeFull="nodeFullLoaded" :active="true"
              :style=`{borderRadius: '4px', maxWidth: '500px'}`).bg-white.q-mt-md
      //- bottom fragment on the right
      q-tab-panel(name="bottom" :style=`{padding: '0px'}` v-if="!isDesktop").column.fit
        div(:style=`{height: '50px'}`).row.full-width.items-center.justify-between.bg-grey-4.q-px-sm
          q-btn(round flat icon="keyboard_arrow_left" no-caps @click="$refs.kpanels.goTo('node')")
          .col
          span.text-bold.q-mr-xs Ядра на нижний фрагмент
        .col.scroll.bg-grey-4
          .row.full-width.justify-center
            node-masonry(key="bottom" :nodes="$nodesDistinct(nodes[1])" @nodeClick="nodeClick").full-width.justify-center
  //- desktop view
  div(v-if="isDesktop").col.full-height.bg-grey-4
    .column.fit
      div(body-scroll-lock-ignore).col.scroll.q-pt-md
        node-masonry(key="desktop" :nodes="$nodesDistinct([...nodes[0], ...nodes[1]])" @nodeClick="nodeClick")
</template>

<script>
import node from 'components/node'
import nodeCss from 'components/node/node_css'
import nodeMasonry from 'components/node_masonry'
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
  components: {node, nodeCss, nodeMasonry},
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
          this.node = null
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
              fragments {
                fragmentIndx
                relativeScale
                relativePoints {
                  x
                }
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
      // return fragmentTopNodes
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
