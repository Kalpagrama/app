<template lang="pug">
//- q-layout(containter :style=`{width: width+'px', minHeight: height+'px'}` @scroll="onScroll").bg-grey-3
//-   q-dialog(ref="subscriptionsDialog" no-route-dismiss :maximized="true" transition-show="slide-up" transition-hide="slide-down")
//-     div(@click.self="$refs.subscriptionsDialog.hide()").row.fit.items-center.justify-center
//-       subscriptions(
//-         @hide="$refs.subscriptionsDialog.hide()"
//-         :subscription="$route.params.category"
//-         :style=`{
//-           borderRadius: '10px', overflow: 'hidden',
//-           maxWidth: $q.screen.width-100+'px', maxHeight: $q.screen.height-100+'px'}`)
//-   q-page-container
//-     node-loader(ref="nodeLoader" mode="feed" :query="query" queryKey="feed" :variables="variables")
//-       template(v-slot:default=`{items, fetchingMore}`)
//-         node-tape(ref="nodeFeed" name="Home" :nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()" @prefetch="$event => $refs.nodeLoader.prefetch($event)")
k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :tabs="true" :style=`{height: height+'px'}`).bg-grey-3
  template(v-slot:foryou)
    node-loader(ref="nodeLoader" :query="query" queryKey="feed" :variables="variables")
      template(v-slot:default=`{items}`)
        div(
          v-for="(n, ni) in items" :key="ni"
          :style=`{height: '500px'}`
          ).row.full-width
          span {{ n }}
</template>

<script>
import subscriptions from './subscriptions'

export default {
  name: 'pageApp__home',
  props: ['width', 'height'],
  components: {},
  data () {
    return {
      coll: 'foryou',
      colls: [
        {id: 'foryou', name: 'For you'},
        {id: 'following', name: 'Following'},
        {id: 's1', name: 'How to kill'},
        {id: 's2', name: 'How to pill'},
        {id: 's3', name: 'How to feel'}
      ],
      drawer: false,
      miniState: false,
      nodes: [],
      query: gql`
        query feed($pageToken: RawJSON) {
          feed(pagination: {pageSize: 100, pageToken: $pageToken}) {
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
      `,
      variables: {
        oid: this.$store.state.auth.user.oid
      }
    }
  },
  methods: {
    onScroll (e) {
      // this.$logD('onScroll', e)
      if (e.directionChanged) {
        let b = true
        if (e.direction === 'down') b = true
        else b = false
        if (this.$refs.nodeFeed) this.$refs.nodeFeed.scrollDirectionChanged(b)
      }
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

<style lang="stylus">
.q-footer {
  background: none !important
}
</style>
