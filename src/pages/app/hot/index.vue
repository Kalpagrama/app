<template lang="pug">
q-layout(containter :style=`{width: width+'px'}` @scroll="onScroll")
  //- drawer
  //- q-drawer(ref="kDrawer" side="left" :width="240").lt-sm
  //-   categories(:style=`{borderRadius: '0 10px 10px 0', overflow: 'hidden'}`)
  q-page-container.bg-grey-3
    .row.full-width.justify-center
      div(style=`width: 200px`).row.gt-xs
        categories(style=`position: fixed; overflow: hidden; maxWidth: 200px; border-radius: 10px`).q-mt-sm
      div(style=`maxWidth: 600px`).row.full-width.justify-center
        node-loader(v-if="sphereOid" :query="query" queryKey="sphereNodes" :variables="variables")
          template(v-slot:items=`{items, fetchingMore}`)
            node-feed(ref="nodeFeed" name="Чего горячего есть?" :nodes="items" :fetchingMore="fetchingMore")
              q-btn(round flat icon="menu" color="black" @click="$refs.kDrawer.toggle()")
      div(style=`width: 250px;`).row.gt-xs
        pageSubscriptions(
          style=`position: fixed; overflow: hidden; maxWidth: 250px; border-radius: 10px`)
  //- q-footer(reveal).bg-grey-4.lt-sm
  //-   k-menu-mobile(page="hot" :colors="['white', 'grey-7']")
</template>

<script>
import categories from 'pages/app/hot/categories'
import pageSubscriptions from 'pages/app/subscriptions'

export default {
  name: 'pageApp__hot',
  components: { categories, pageSubscriptions },
  props: ['width', 'height'],
  data () {
    return {
      category: undefined
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.category) {
          this.category = to.params.category
        } else {
          this.$nextTick(() => {
            this.$refs.kDrawer.toggle()
          })
          this.$router.push({params: {category: this.categories[Object.keys(this.categories)[0]].type}})
        }
      }
    }
  },
  computed: {
    sphereOid () {
      if (this.categories[this.category]) return this.categories[this.category].sphere.oid
      else return false
    },
    query () {
      return gql`
        query sphereNodes ($sphereOid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
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
                  fragments { uid width height color thumbUrl(preferWidth: 600) }
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
        pagination: {
          pageSize: 100
        },
        sortStrategy: 'HOT',
        filter: {
          types: 'NODE'
        }
      }
    },
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      if (e.directionChanged) {
        let b = true
        if (e.direction === 'down') b = true
        else b = false
        if (this.$refs.nodeFeed) this.$refs.nodeFeed.scrollDirectionChanged(b)
      }
    },
    async categoryClick (c, ci) {
      this.$log('categoryClick', c, ci)
      this.$refs.kDrawer.hide()
      await this.$wait(200)
      this.$router.push({params: {category: c.type}})
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

<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>
