<template lang="pug">
.row.fit.justify-center
  div(style=`maxWidth: 1130px`).row.fit.justify-center
    slot(name="menu")
    .col.full-height
      k-feed
</template>

<script>
import nodeCard from 'components/node/node_card'
import kMenu from 'pages/app/menu'
import kFeed from 'components/kFeed'

export default {
  name: 'pageApp__Home',
  components: { nodeCard, kMenu, kFeed },
  data () {
    return {
      query: gql`
        query feed {
          feed(type: NEWS, pagination: {pageSize: 10, pageToken: null} filter: {types:[NODE]} ){
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
          }
        }
      `,
      variables: {
        oid: this.$store.state.auth.user.oid
      }
    }
  },
  watch: {
    // '$store.state.feed.node': {
    //   deep: true,
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('feed.oid changed', to.oid)
    //     let n = this.$refs['node_' + to.oid]
    //     // this.$log('node', this.$refs['node_' + to.oid])
    //     this.$store.commit('feed/state', ['top', n[0].$el.offsetTop])
    //   }
    // }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
