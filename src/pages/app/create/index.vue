<template lang="pug">
.row.fit.justify-center
  div(style=`maxWidth: 1130px`).row.fit.justify-start.q-px-md
    //- slot(name="menu")
    .col.full-height
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
