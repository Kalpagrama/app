<template lang="pug">
.row.fit.justify-center.q-px-md
  router-view
</template>

<script>
export default {
  name: 'pageApp_Create',
  components: {},
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
