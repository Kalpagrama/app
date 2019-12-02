<template lang="pug">
node-creator
</template>

<script>
import nodeCreator from 'components/node_creator'

export default {
  name: 'pageApp_сreate',
  props: [],
  components: {nodeCreator},
  data () {
    return {
    }
  },
  watch: {
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
