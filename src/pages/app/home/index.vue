<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.bg-white
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(icon="home" flat round color="primary")
    .col
      .row.fit.items-center.justify-center
        span Моя лента
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(icon="more_vert" flat round color="primary")
  div(style=`paddingTop: 0px`).col.scroll.bg-grey-3
    apollo-query(:query="query2" :variables="variables")
      template(v-slot="{ result: { loading, error, data } }")
        div(v-if="loading").row.fit.items-center.justify-center
            q-spinner(size="50px")
        div(v-else-if="error").row.fit.items-center.justify-center
          span {{ error }}
        template(v-else-if="data && data.sphereNodesFeed")
          node-card(v-for="(n, ni) in data.sphereNodesFeed.items" :key="n.oid" :node="n" :active="false"
            v-observe-visibility=`{
              callback: (isVisible, entry) => visibilityChanged(isVisible, entry, n, ni),
              throttle: ni <  2 ? 0 : 700
            }`)
        div(v-else).row.fit.items-center.justify-centers
          span Nothing found!
</template>

<script>
import nodeCard from 'components/node/node_card'

export default {
  name: 'pageApp_Home',
  components: { nodeCard },
  data () {
    return {
      show_refresh: false,
      show_header: false,
      filter: {},
      page: 12,
      query: gql`
        query feed {
          feed (type: NEWS, pagination: {pageSize: 2}) {
            totalCount
            items {
              oid
              type
              thumbUrl (preferWidth: 400, preferHeight: 200)
              createdAt
              name
            }
            nextPageToken
          }
        }
      `,
      query2: gql`
        query nodes($oid: OID!) {
          sphereNodesFeed (sphereOid: $oid, pagination: {pageSize: 20}) {
            totalCount
            items {
              oid
              type
              thumbUrl (preferWidth: 400, preferHeight: 200)
              createdAt
              name
            }
            nextPageToken
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
