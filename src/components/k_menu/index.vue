<template lang="pug">
.column.fit
  span kMenu
</template>

<script>
export default {
  name: 'kMenu',
  props: ['mini'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    refresh () {
      this.$log('refresh')
      window.location.reload(true)
    },
    async logout () {
      this.$log('logout')
      await this.$apollo.query({
        query: gql`
          query logout {
            logout
          }
        `
      })
      this.$router.push('/login')
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
