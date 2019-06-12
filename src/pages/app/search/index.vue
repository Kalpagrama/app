<template lang="pug">
.column.fit
  div(style=`height: 70px`
    ).row.full-width.items-end.content-end.q-px-sm
    q-input(filled label="Найти" v-model="search" @input="handleSearch").fit
      template(v-slot:prepend)
        q-icon(name="search")
      template(v-slot:append)
        q-btn(v-if="search.length > 0" icon="clear" round flat @click="search = ''")
  div(style=`height: 45px; borderBottom: 1px solid #eee`
    ).row.full-width.no-wrap.items-start.q-px-sm
    div(v-for="(t, ti) in tags" :key="ti").row
      q-btn(:flat="!tagsSelected.includes(t)" :outline="tagsSelected.includes(t)"
        :disabled="!tagsSelected.includes(t)" color="primary" no-caps) {{ t }}
  .col.scroll.bg-grey-2
    apollo-query(:query="query" :variables="variables")
      template(v-slot="{ result: { loading, error, data } }")
        //- loading
        div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
        //- error
        div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
          span {{ error }} : (
        //- items
        template(v-else-if="data && data.feed")
          node-card(v-for="(n, ni) in data.feed.items" :key="n.oid" :node="getNode(n)")
        //- nothing
        div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
    //- div(style=`height: 60px;`).row.full-width.items-center.justify-center
    //-   span Ничего не найдено :(
</template>

<script>
import nodeCard from 'components/node/node_card'
export default {
  name: 'pageApp__Search',
  components: { nodeCard },
  data () {
    return {
      tag: '',
      tags: ['Ядра', 'Люди', 'Цепочки', 'Контент'],
      tagsSelected: ['Ядра'],
      search: 'hello',
      query: gql`
        query nodes($search: String!) {
          feed(type: SEARCH_COMMON, pagination: {pageSize: 5, pageToken: null} filter: {types:[NODE], text: $search} ){
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
            }
          }
        }
      `
    }
  },
  computed: {
    variables () {
      return {
        search: this.search
      }
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        let q = to.query.q
        if (q) this.search = q
      }
    }
  },
  methods: {
    handleSearch (e) {
      this.$log('handleSearch')
      this.$router.push({query: {q: e}})
    },
    getNode (n) {
      this.$log('getNode', n)
      return {visible: true, ...n}
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
