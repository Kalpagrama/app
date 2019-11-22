<template lang="pug">
q-layout(:container="true" :style=`{width: width+'px', height: height+'px'}`)
  q-page-container.fit.bg-grey-3
    .column.fit
      //- header
      div(:style=`{height: '50px'}`).row.full-width.items-center.bg-white.q-px-xs
        q-btn(flat no-caps :color="tab === 'categories' ? 'green' : 'grey'")
          span(:class=`{'text-bold': tab === 'hot'}` @click="tab = 'categories'") {{ $t('Categories') }}
        .col
        q-btn(flat no-caps :color="tab === 'HOT' ? 'green' : 'grey'")
          span(:class=`{'text-bold': tab === 'hot'}` @click="tab = 'HOT'") {{ $t('Hot') }}
        q-btn(flat no-caps :color="tab === 'AGE' ? 'green' : 'grey'")
          span(:class=`{'text-bold': tab === 'fresh'}` @click="tab = 'AGE'") {{ $t('Fresh') }}
      //- body
      .col.full-width
        k-colls(ref="kCollsTabs" @value="tab = $event" :value="tab" :colls="tabs" :style=`{height: height+'px'}`)
          template(v-slot:categories)
            categories(:categories="categories" :category="category")
          template(v-slot:HOT)
            node-loader(:query="query" queryKey="sphereNodes" :variables="variables('HOT')")
              template(v-slot:default=`{items, fetchingMore}`)
                node-tape(:nodes="items")
          template(v-slot:AGE)
            node-loader(:query="query" queryKey="sphereNodes" :variables="variables('AGE')")
              template(v-slot:default=`{items, fetchingMore}`)
                node-tape(:nodes="items")
</template>

<script>
import categories from './categories'

export default {
  name: 'pageApp__hot',
  components: { categories },
  props: ['width', 'height'],
  data () {
    return {
      tab: 'HOT',
      tabs: {
        categories: {name: 'Categories'},
        HOT: {name: 'Hot'},
        AGE: {name: 'Fresh'}
      },
      category: 'ALL'
    }
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.category) {
          this.category = to.params.category
          if (to.params.sort) {
            // this.mode = to.params.mode
          } else {
            this.$router.push({params: {mode: to.params.mode}})
          }
        } else {
          this.$router.push({params: {
            category: 'ALL',
            sort: 'HOT'
          }})
        }
      }
    }
  },
  computed: {
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
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    }
  },
  methods: {
    variables (sort) {
      return {
        sphereOid: this.categories[this.category].sphere.oid,
        pagination: { pageSize: 100 },
        sortStrategy: sort || 'HOT',
        filter: { types: 'NODE' }
      }
    }
  }
}
</script>
