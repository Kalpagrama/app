<template lang="pug">
.column.fit
  div(body-scroll-lock-ignore).col.scroll.bg-grey-2
    .row.fit.justify-center
      div(style=`maxWidth: 1130px`).row.fit.justify-start
        slot(name="menu")
        div(style=`maxWidth: 540px; marginLeft: 14px !important; marginRight: 14px !important`).row.full-width.justify-center.q-py-md
          apollo-query(v-if="true" :query="query2" :variables="variables").full-width
            template(v-slot="{ result: { loading, error, data } }")
              //- loading
              div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
                  q-spinner(size="50px" color="primary" :thickness="2")
              //- error
              div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
                span {{ error }} : (
              //- items
              template(v-else-if="data && data.feed")
                node-card(v-for="(n, ni) in data.feed.items" :key="n.oid" :node="n" :active="false"
                  v-observe-visibility=`{
                    callback: (isVisible, entry) => visibilityChanged(isVisible, entry, n, ni),
                    throttle: ni <  2 ? 0 : 300
                  }`)
              //- nothing
              div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
                q-spinner(size="50px" :thickness="2" color="primary")
        div(v-if="true" style=`position: relative; width: 280px; maxHeight: 100%`).column.full-height.q-py-md
          div(style=`position: fixed; width: 280px; height: 700px`).row
            div(style=`borderRadius: 8px`).row.fit.items-center.justify-center.bg-white
              q-icon(name="flash_on")
              span Some popular tags and sh*t
</template>

<script>
import nodeCard from 'components/node/node_card'
import kMenu from 'pages/app/menu'

export default {
  name: 'pageApp__Home',
  components: { nodeCard, kMenu },
  data () {
    return {
      show_refresh: false,
      show_header: false,
      filter: {},
      page: 12,
      query: gql`
        query sphereNodes($oid: OID!) {
          sphereNodes (sphereOid: $oid, pagination: {pageSize: 20}) {
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
      query2: gql`
        query feed {
          feed(type: NEWS, pagination: {pageSize: 5, pageToken: null} filter: {types:[NODE]} ){
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
  methods: {
    handleScroll (e) {
      // this.$log('handleScroll', e)
      if (e.direction === 'down') this.show_header = false
      else this.show_header = true
    },
    async refresh () {
      this.$log('refresh')
      this.show_refresh = true
      await this.$wait(3000)
      this.show_refresh = false
    },
    visibilityChanged (isVisible, entry, n, ni, next) {
      // this.$log('vc', ni)
      // TODO: function to detect friend based on positions...
      // we need an array of nodes
      if (isVisible) {
        this.$set(n, 'visible', true)
        // this.$set(next[0], 'visible', true)
      } else {
        this.$set(n, 'visible', false)
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
