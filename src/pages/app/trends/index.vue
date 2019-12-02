<template lang="pug">
q-layout(:container="true" :style=`{width: width+'px', height: height+'px'}`)
  q-dialog(ref="categoriesDialog" no-route-dismiss :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.categoriesDialog.hide()").row.fit.items-center.justify-center
      categories(
        @hide="$refs.categoriesDialog.hide()"
        :category="$route.params.category" :categories="categories"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          maxWidth: $q.screen.width-100+'px', maxHeight: $q.screen.height-100+'px'}`)
  q-page-container.fit.bg-grey-3
    .column.fit
      //- header
      div(:style=`{height: '60px'}`).row.full-width.items-center.bg-white.q-px-xs
        q-btn(round flat icon="menu" color="grey" @click="$refs.categoriesDialog.show()")
        q-btn(flat no-caps).q-px-xs
          span(:class=`{'text-bold': !$route.params.category}`) {{ categoryName | cut(50) }}
        .col
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(v-if="$route.params.category" flat no-caps :color="$route.query.sort === 'HOT' ? 'green' : 'grey'")
            span(:class=`{'text-bold': $route.query.sort === 'HOT'}` @click="$router.push({query: {sort: 'HOT'}})") {{ $t('Hot') }}
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(v-if="$route.params.category" flat no-caps :color="$route.query.sort === 'AGE' ? 'green' : 'grey'")
            span(:class=`{'text-bold': $route.query.sort === 'AGE'}` @click="$router.push({query: {sort: 'AGE'}})") {{ $t('Fresh') }}
      //- body
      .col.full-width
        k-colls(ref="kCollsTabs" @coll="collChanged" :coll="coll" :colls="colls" :style=`{height: height-60+'px'}`)
          template(v-slot:HOT)
            node-loader(v-if="sphereOid" :query="query" queryKey="sphereNodes" :variables="variables('HOT')")
              template(v-slot:default=`{items, fetchingMore}`)
                node-tape(:nodes="items")
          template(v-slot:AGE)
            node-loader(v-if="sphereOid" :query="query" queryKey="sphereNodes" :variables="variables('AGE')")
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
      coll: 'HOT',
      colls: [
        {id: 'HOT', name: 'Hot'},
        {id: 'AGE', name: 'Fresh'}
      ]
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler (to, from) {
        this.$logD('$route CHANGED', to.params.category, to.query.sort)
        if (to.params.category) {
          if (to.query.sort) {
            this.coll = to.query.sort
          } else {
            this.$router.push({query: {sort: 'HOT'}})
          }
        } else {
          this.$router.replace({params: {category: 'ALL'}, query: {sort: 'HOT'}})
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
    },
    categoryName () {
      let category = this.$route.params.category
      if (category) {
        let name = this.categories[category].name
        return `#${name.charAt(0).toUpperCase() + name.slice(1)}`
      } else {
        return this.$t('Catagories')
      }
    },
    sphereOid () {
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
    }
  },
  methods: {
    collChanged (coll) {
      this.$logD('collChanged', coll)
      this.$router.push({query: {sort: coll}})
    },
    variables (sort) {
      return {
        sphereOid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: sort || 'HOT',
        filter: { types: 'NODE' }
      }
    }
  }
}
</script>
