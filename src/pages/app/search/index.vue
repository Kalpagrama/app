<template lang="pug">
.row.full-width.bg-red
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
      search: 'hello'
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
      this.$logD('handleSearch')
      this.$router.push({query: {q: e}})
    },
    getNode (n) {
      this.$logD('getNode', n)
      return {visible: true, ...n}
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
