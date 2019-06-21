<template lang="pug">
.column.fit
  div(style=`paddingTop: 0px` body-scroll-lock-ignore).col.scroll.bg-grey-2
    .row.fit.justify-center
      div(style=`width: 300px`).row.full-height.q-pa-md
        div(style=`overflow: hidden; borderRadius: 8px`).row.fit
          k-menu
      div(style=`maxWidth: 540px`).row.full-width.justify-center.q-py-md
        div(style=`borderRadius: 8px`).row.full-width.bg-white
          node-card(v-if="node" :node="node")
        div(style=`borderRadius: 8px`).row.full-width.q-mt-md
          apollo-query(:query="query")
            template(v-slot="{ result: { loading, error, data } }")
              //- loading
              div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
                  q-spinner(size="50px" color="primary" :thickness="2")
              //- error
              div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
                span {{ error }} : (
              //- items
              template(v-else-if="data && data.feed")
                node-card(v-for="(n, ni) in data.feed.items" :key="n.oid" :node="n"
                  v-observe-visibility=`{
                    callback: (isVisible, entry) => visibilityChanged(isVisible, entry, n, ni),
                    throttle: ni <  2 ? 0 : 300
                  }`)
              //- nothing
              div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
                q-spinner(size="50px" :thickness="2" color="primary")
      div(style=`position: relative; width: 300px`).row.full-height.q-pa-md
        div(style=`position: fixed; height: 600px; width: 300px`).row
          div(style=`borderRadius: 8px`).row.fit.items-center.justify-center.bg-white
            span Etra info about node friends
</template>

<script>
import nodeCard from 'components/node/node_card'
import kMenu from 'pages/app/menu'

export default {
  name: 'pageApp__Node',
  components: { nodeCard, kMenu },
  props: {},
  data () {
    return {
      node: null,
      query: gql`
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
      `
    }
  },
  methods: {
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let {data: {objectList}} = await this.$apollo.query({
        query: gql`
          query objectList ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodeLoad done')
      return objectList[0]
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
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to.query.node) {
          this.node = await this.nodeLoad(to.query.node)
          this.node.visible = true
        }
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
