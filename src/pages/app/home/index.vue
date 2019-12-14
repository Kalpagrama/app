<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-header(
    v-if="true"
    reveal
    ).row.full-width.justify-center.q-px-sm.bg-grey-3
    k-colls-tabs(:style=`{maxWidth: '500px', borderRadius: '0 0 10px 10px'}`).bg-white
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: '500px'}`)
  q-page-conainter
    div(:style=`{paddingTop: '70px', paddingBottom: '70px'}`).row.full-width.justify-center.items-start.content-start
      div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start.q-pa-sm
        //- k-colls-new
        //- k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :tabs="true" :style=`{height: height+'px'}`).bg-grey-3
        node-loader(v-if="sphereOid" ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
          template(v-slot:default=`{nodes}`)
            node-list(:nodes="nodes" @nodeClick="nodeClick")
</template>

<script>
export default {
  name: 'pageAppHome',
  props: [],
  data () {
    return {
      width: 0,
      coll: 'foryou',
      colls: [
        {id: 'foryou', name: 'For you'},
        {id: 'following', name: 'Following'},
        {id: 's1', name: 'How to kill'},
        {id: 's2', name: 'How to pill'},
        {id: 's3', name: 'How to feel'}
      ],
      // query: gql`
      //   query feed($pageToken: RawJSON) {
      //     feed(pagination: {pageSize: 100, pageToken: $pageToken}) {
      //       count
      //       totalCount
      //       nextPageToken
      //       items {
      //         oid
      //         type
      //         thumbUrl (preferWidth: 600)
      //         createdAt
      //         name
      //         meta {
      //           ...on MetaNode {
      //             layout
      //             fragments { width height thumbUrl(preferWidth: 600) }
      //           }
      //         }
      //       }
      //     }
      //   }
      // `
    }
  },
  computed: {
    // variables () {
    //   return {
    //     oid: this.$store.state.objects.currentUser.oid
    //   }
    // },
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    sphereOid () {
      return this.categories.FUN.sphere.oid
      // else return false
    },
    query () {
      return gql`
        query sphereNodesHome ($sphereOid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
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
                  fragments { width height thumbUrl(preferWidth: 600) }
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
  },
  watch: {
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      // this.$store.commit('node/stateSet', ['node', val])
      this.$router.push('/node/' + val[0].oid)
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      // if (this.previewHeight > 0 && e.position >= this.previewHeight) {
      //   this.showNameSticky = true
      // } else {
      //   this.showNameSticky = false
      // }
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
