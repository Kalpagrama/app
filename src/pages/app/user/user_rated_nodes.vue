<template lang="pug">
.row.full-width
  node-loader(ref="nodeLoader" :query="query" :variables="variables" queryKey="sphereNodes")
    template(v-slot:default=`{nodes}`)
      .row.full-width.items-start.content-start.q-pt-sm
        div(
          v-for="(n, ni) in nodes" :key="n.oid"
          ).row.full-width.q-mb-xl
          node(
            @nameClick="nameClick" @action="$refs.nodeActionDialog.show()"
            :style=`n.oid === nodeOid ? {...nodeStyles, ...{zIndex: nodeZIndex}} : {zIndex: zIndex}`
            :zIndex="zIndex" :index="ni" :node="n" :opened="n.oid === nodeOid" :pinned="n.oid === nodeOid && nodePinned"
            :active="nodesVisible[0] ? nodesVisible[0] === n.oid : false"
            :ref="'node-'+n.oid" :lang="n.oid"
            v-observe-visibility=`{
              callback: nodeVisible,
              throttle: 230,
              intersection: {
                threshold: 0.98
              }
            }`)
          div(
            v-if="n.oid === nodeOid"
            :style=`{height: nodeRect.height+'px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-grey-3
</template>
<script>
import node from './node'
export default {
  name: 'user__rated_nodes',
  props: {
    zIndex: {type: Number, default () { return 100 }},
    node: {type: Object},
    opened: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  components: {node},
  data () {
    return {
      headerShow: true,
      sphereOid: undefined,
      nodePinned: true,
      nodeOid: undefined,
      nodeRect: null,
      nodeStyles: {
        position: 'absolute',
        height: 0,
        width: 0,
        top: 0
      },
      nodeGoTimeout: 0.4,
      tintOpacity: 0,
      scrollTop: 0,
      nodesVisible: []
    }
  },
  computed: {
    nodeZIndex () {
      return this.zIndex + 200
    },
    query () {
      return gql`
        query sphereNodesRated ($sphereOid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $sphereOid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
              meta {
                ...on MetaNode {
                  layout
                  fragments { width height color thumbUrl(preferWidth: 600) }
                }
              }
            }
          }
        }
      `
    },
    variables () {
      return {
        sphereOid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
    categories () {
      return this.$store.state.node.categories
    },
    colls () {
      return this.$store.state.node.categories.map((c, ci) => {
        c.id = c.sphere.oid
        return c
      })
    }
  },
  methods: {
    nameClick ([node, rect]) {
      this.$logD('nameClick', node, rect)
      this.nodeRect = rect
      this.nodeStyles.height = rect.height + 'px'
      this.nodeStyles.width = rect.width + 'px'
      this.nodeStyles.top = rect.top - 50 + 'px'
      this.nodeOid = node.oid
      this.$tween.to(this.nodeStyles, this.nodeGoTimeout, {
        top: 0 + 'px',
        onComplete: () => {
          this.nodePinned = true
        }
      })
      this.$tween.to(this, this.nodeGoTimeout, {tintOpacity: 1})
    },
    nodeAction (action) {
      this.$logD('nodeAction', action)
      switch (action) {
        case 'fragment': {
          break
        }
      }
    },
    nodeBack () {
      this.$logD('nodeBack')
      this.nodePinned = false
      this.$tween.to(this.nodeStyles, this.nodeGoTimeout, {
        top: this.nodeRect.top + 'px',
        onComplete: () => {
          this.nodeOid = undefined
          this.nodeRect = null
        }
      })
      this.$tween.to(this, this.nodeGoTimeout, {tintOpacity: 0})
    },
    nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$logD('nodeVisible', isVisible, entry.target.lang)
        this.nodesVisible.unshift(entry.target.lang)
      } else {
        this.$logD('nodeVisible', isVisible, entry.target.lang)
        this.nodesVisible = this.nodesVisible.filter(n => (n.oid !== entry.target.lang))
      }
    },
    onScroll (e) {
      // this.$logD('onScroll', e)
      let scrollTop = this.$refs.nodePinScroll.scrollTop
      if (this.scrollTop > scrollTop) this.headerShow = true
      else this.headerShow = false
      this.scrollTop = scrollTop
    }
  },
  created () {
    this.sphereOid = this.colls[0].id
  },
  mounted () {
    this.$logD('mounted', this.zIndex)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
