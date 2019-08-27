<template lang="pug">
.row.full-width
  span search
</template>

<script>
export default {
  name: 'pageApp__Search',
  components: {},
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
