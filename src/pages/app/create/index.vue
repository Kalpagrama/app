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
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
