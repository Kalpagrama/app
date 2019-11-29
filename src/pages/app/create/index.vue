<template lang="pug">
node-creator(:height="height" :width="width")
</template>

<script>
import nodeCreator from 'components/node_creator'

export default {
  name: 'pageApp_сreate',
  props: ['height', 'width'],
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
