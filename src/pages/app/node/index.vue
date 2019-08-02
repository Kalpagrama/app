<template lang="pug">
.row.fit.bg-red
  q-dialog(ref='dialogExploreNode' :maximized="true" transition-show="slide-right" transition-hide="slide-left")
    node-explorer(:width="width" :height="height" :node="node" @close="$refs.dialogExploreNode.hide()")
  q-btn(@click="$refs.dialogExploreNode.show()" color="primary" no-caps) explore node
</template>

<script>
import nodeFragment from 'components/node/node_fragment'
import nodeCard from 'components/node/node_card'
import node from 'components/node'
import nodeExplorer from 'components/node_explorer'

export default {
  name: 'pageApp__Node',
  components: { node, nodeCard, nodeFragment, nodeExplorer },
  props: ['width', 'height'],
  data () {
    return {
      mode: 'second',
      node: null,
      nodes: [],
      needFull: true,
      name: '',
      lefts: [0, 0],
      isScrolling: false,
      isTweening: false,
      fragmentCurrentIndex: 0
    }
  },
  computed: {
    getHeight () {
      return this.height - 50
    },
    getWidth () {
      let w = this.width
      if (w >= 400) return 400
      else return w - 30
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.node = null
          this.node = await this.nodeLoad(to.params.oid)
          this.nodes = []
          // this.nodes = await this.nodesLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let { data: { objectList: [nodeFull] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
              ...on Node {
                rate
                # viewCnt
                # rateUser
                author {
                  oid
                  type
                  name
                  thumbUrl(preferWidth: 600)
                  __typename
                }
                spheres {
                  oid
                  name
                }
                fragments {
                  url
                  content {
                    oid
                    type
                    name
                    thumbUrl(preferWidth: 600)
                    ...on Video {
                      url
                      urlType
                      width
                      height
                    }
                    ...on Image {
                      url
                    }
                  }
                  relativePoints { x y z }
                  relativeScale
                }
              }
            }
          }
        `,
        variables: {
          oid: oid
        },
        fetchPolicy: 'cache-first'
      })
      this.$log('nodeFull loaded', nodeFull.name)
      return nodeFull
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start')
      let {data: {sphereNodes: {items}}} = await this.$apollo.query({
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
      this.$log('nodesLoad done', items)
      return items
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
