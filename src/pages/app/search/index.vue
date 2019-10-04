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
