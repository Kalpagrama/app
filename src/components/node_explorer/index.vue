<style lang="stylus">
.q-header {
  background: none !important;
}
.mejs__playpause-button {
  display: none !important
}
iframe {
  width: 100% !important;
  height: 100% !important;
}
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-header(
    v-if="showNameSticky"
    ).row.full-width.justify-center
    .col.bg-grey-3
    div(:style=`{maxWidth: '500px'}`).row.full-width.q-px-sm
      div(:style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.bg-grey-3.q-pt-sm
        div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden', }`).row.full-width.items-center.justify-center.bg-white
          span(v-if="node").text-bold.text-black {{ node.name }}
    .col.bg-grey-3
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: '500px'}`)
  q-page-conainter
    .row.full-width.justify-center.items-start.content-start
      .row.full-width.justify-center
        div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start.q-pa-sm
          .row.full-width.items-start.content-start
            node(
              v-if="node" ref="neNode"
              :ctx="'inList'"
              :width="width" :node="node" :nodeFullReady="node"
              @previewLoaded="previewHeight = $event").bg-white.q-mb-md
      div(
        v-if="false"
        :style=`{marginBottom: '1000px'}`).row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '500px'}`).row.full-width.q-pa-sm
          node-loader(v-if="nodeOid" ref="nodeLoader" :query="query" queryKey="nodeNodes" :variables="variables")
            template(v-slot:default=`{nodes}`)
              node-list(:nodes="nodes" @nodeClick="nodeClick")
</template>

<script>
export default {
  name: 'nodeExplorer',
  props: [],
  data () {
    return {
      width: 0,
      node: null,
      showNameSticky: false,
      previewHeight: 0,
      query: gql`
        query nodeExplorerNodeNodes ($oid: OID!, $pageToken: RawJSON) {
          nodeNodes(nodeOid: $oid, pagination: {pageSize: 100, pageToken: $pageToken}, sortStrategy: HOT) {
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
                  fragments { width height thumbUrl(preferWidth: 600) }
                }
              }
            }
          }
        }
      `
    }
  },
  computed: {
    nodeOid () {
      if (this.node) return this.node.oid
      else return false
    },
    variables () {
      return {
        oid: this.nodeOid
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          let node = this.$store.state.node.node
          if (node) this.node = node
          else this.node = await this.nodeLoad(to.params.oid)
          await this.$wait(500)
          this.$nextTick(() => {
            // this.$refs.neNode.fragmentMini()
          })
        }
      }
    }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      this.$router.push('/node/' + val[0].oid)
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
      return node
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      if (this.previewHeight > 0 && e.position >= this.previewHeight) {
        this.showNameSticky = true
      } else {
        this.showNameSticky = false
      }
    },
    onResize (e) {
      this.width = e.width
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
