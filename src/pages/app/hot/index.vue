<template lang="pug">
q-layout(:container="true" :style=`{width: width+'px', height: height+'px'}` @scroll="onScroll")
  q-page-container.fit.bg-grey-3
    k-dialog-bottom(ref="nodeActionDialog" mode="actions" :options="nodeActionDialogOptions")
    q-tab-panels(
      v-model="tab" @input="tabChanged" :swipeable="mode !== 'fresh'" animated keep-alive
      :style=`{height: height+'px', background: 'none', margin: 0, padding: 0}`).fit
      q-tab-panel(name="categories" :style=`{padding: 0, margin: 0, height: height+'px'}`)
        categories(:category="category" @category="category = $event")
      q-tab-panel(name="feed" :style=`{padding: 0, margin: 0, height: height+'px'}`)
        .column.fit
          //- div(:style=`{height: '50px'}`).row.full-width.items-center.bg-white
          //-   q-btn(flat round icon="list" :color="tab === 'categories' ? 'green' : 'grey'" @click="tab = 'categories'")
          //-   q-btn(flat no-caps).q-px-xs
          //-     span {{ $t(category) }}
          //-   .col
          //-   q-btn(flat no-caps :color="mode === 'hot' ? 'green' : 'grey'")
          //-     span(:class=`{'text-bold': mode === 'hot'}` @click="mode = 'hot'") {{ $t('Hot') }}
          //-   q-btn(flat no-caps :color="mode === 'fresh' ? 'green' : 'grey'")
          //-     span(:class=`{'text-bold': mode === 'fresh'}` @click="mode = 'fresh'") {{ $t('Fresh') }}
          //- debug
          div(v-if="false").row.full-width.bg-red
            small.full-width scrollTop/scrollHeight {{scrollTop}}/{{scrollHeight}}
            small.full-width clientHeight: {{ clientHeight }}
            small.full-width {{clientHeight + scrollTop}}
          .col.full-width
            q-tab-panels(
              v-model="mode" @input="modeChanged" swipeable animated keep-alive
              :style=`{height: height+'px', margin: 0, padding: 0, background: 'none'}`).fit
              q-tab-panel(
                v-for="(m, mi) in modes" :key="m"
                :name="m" :style=`{position: 'relative', height: height+'px', padding: 0, margin: 0}`)
                node-loader(v-if="sphereOid" :query="query" queryKey="sphereNodes" :variables="variables")
                  template(v-slot:default=`{items, fetchingMore}`)
                    node-tape(:nodes="items")
</template>

<script>
import categories from 'pages/app/hot/categories'

export default {
  name: 'pageApp__hot',
  components: { categories },
  props: ['width', 'height'],
  data () {
    return {
      tab: 'categories',
      tabs: ['categories', 'feed'],
      mode: 'hot',
      modes: ['hot', 'fresh'],
      category: 'ALL',
      clientHeight: 0,
      scrollTop: 0,
      scrollHeight: 0,
      nodeActive: 0
    }
  },
  watch: {
    'category': {
      handler (to, from) {
        // this.$log('category CHANGED', to)
        this.tab = 'feed'
      }
    },
    '$route': {
      immediate: true,
      handler (to, from) {
        // this.$log('$route CHANGED', to)
        if (to.params.category) {
          this.category = to.params.category
          if (to.params.mode) {
            this.mode = to.params.mode
          } else {
            this.$router.push({params: {mode: to.params.mode}})
          }
        } else {
          this.$router.push({params: {
            category: 'ALL',
            mode: 'hot'
          }})
        }
      }
    }
  },
  computed: {
    nodeActionDialogOptions () {
      return {
        header: true,
        headerName: 'Node',
        confirm: true,
        confirmName: 'FUCK ME'
      }
    },
    nodeHeight () {
      // return this.height - 100
      return this.height / 2
    },
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
    feedWrapperSwipeDown (e) {
      this.$log('feedWrapperSwipeDown', e)
      switch (e.direction) {
        case 'up': {
          this.nodeClick(null, this.nodeActive + 1)
          break
        }
        case 'down': {
          if (this.nodeActive === 0) return
          this.nodeClick(null, this.nodeActive - 1)
          break
        }
      }
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      if (this.nodeActive === ni) {
        // this.$log('ON ACTIVE')
        this.$refs.nodeActionDialog.show()
      } else {
        let scrollTo = (this.nodeHeight + 40) * (ni)
        // this.$log('scrollTo', scrollTo)
        this.$tween.to(
          this.$refs.feedWrapper,
          0.3,
          {
            scrollTop: scrollTo,
            onComplete: async () => {
              // await this.$wait(200)
              // this.$log('SCROLLED TO NODE')
              this.nodeActive = ni
            }
          }
        )
      }
    },
    modeScrolled (e) {
      // this.$log('modeScrolled', e)
      this.scrollTop = e.target.scrollTop
      this.scrollHeight = e.target.scrollHeight
      this.clientHeight = e.target.clientHeight
    },
    tabChanged (tab) {
      this.$log('tabChanged,', tab)
    },
    modeChanged (mode) {
      this.$log('modeChanged')
      this.$router.push({params: {mode: mode}})
    },
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
