<template lang="pug">
q-layout
  q-drawer(ref="kDrawer" side="left" :width="240")
    div(@click.self="$refs.kDrawer.toggle()").row.fit.items-start.content-start
      div(:style=`{height: 'calc(var(--vh, 1vh) * 100)', borderRadius: '0 10px 10px 0', overflow: 'hidden'}`).column.full-width.bg-grey-4
        //- header
        div(:style=`{height: '70px'}`).row.full-width.bg-white
          div(v-if="false" :style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
            q-btn(round flat color="primary" icon="menu")
          .col.full-height
            .row.fit.items-center.q-px-md
              span.text-bold Категории
        //- body
        div(body-scroll-lock-ignore).col.scroll.full-width
          .row.full-width.items-start.bg-white
            div(
              v-for="(c,ci) in categories" :key="ci" @click="categoryClick(c, ci)"
              :style=`{height: '60px'}`
              ).row.full-width.items-center.q-px-md.cursor-pointer.hr
              span {{ `#${c.name.charAt(0).toUpperCase() + c.name.slice(1)}` }}
  q-page-container
    node-loader(mode="feed" :query="query" queryKey="sphereNodes" :variables="variables")
</template>

<script>
export default {
  name: 'pageApp__hot',
  components: {},
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
          this.$router.push({params: {category: this.categories[Object.keys(this.categories)[0]].type}})
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
            items {
              oid
              type
              name
            }
          }
        }
      `
    },
    variables () {
      return {
        sphereOid: this.categories[this.category].sphere.oid,
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
    async categoryClick (c, ci) {
      this.$log('categoryClick', c, ci)
      this.$refs.kDrawer.hide()
      await this.$wait(200)
      this.$router.push({params: {category: c.type}})
    }
  },
  mounted () {
    this.$log('mounted')
    this.$root.$on('page', () => {
      this.$refs.kDrawer.toggle()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
