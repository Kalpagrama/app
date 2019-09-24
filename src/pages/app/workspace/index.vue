<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).column.full-width.bg-grey-4
  div(body-scroll-lock-ignore).col.scroll
    workspace
</template>

<script>
import workspace from 'components/workspace'

export default {
  name: 'page_app_workspace',
  components: {workspace},
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  watch: {
  },
  async mounted () {
    this.$log('mounted')
    // upload workspace?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
