<template lang="pug">
.column.fit
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
              throttle: 600
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
          impersonate(login: "4321ip@mail.ru")
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
          # impersonate(login: "4321ip@mail.ru")
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
    visibilityChanged (isVisible, entry, n, ni) {
      // this.$log('vc', ni)
      if (isVisible) {
        this.$set(n, 'visible', true)
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
