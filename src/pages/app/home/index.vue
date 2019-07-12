<template lang="pug">
.row.fit.justify-start
  div(:class=`{'q-px-md': $q.screen.width > $store.state.ui.nodeMaxWidth+10}`)
    k-feed(:mini="true" queryKey="feed")
  //- right menu
  div(v-if="false" style=`position: relative; width: 200px`).row.full-height.q-py-md
    div(:style=`{position: 'fixed', width: '200px', height: '500px', borderRadius: $store.state.ui.radiusDefault+'px'}`).row.bg-white
      span Right menu
</template>

<script>
import kMenu from 'components/kMenu'
import kFeed from 'components/kFeed'

export default {
  name: 'pageApp__Home',
  components: { kMenu, kFeed },
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
