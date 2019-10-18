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
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
