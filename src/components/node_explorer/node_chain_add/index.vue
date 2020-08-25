<template lang="pug">
q-btn(
  @click="start()"
  round push dense color="green" icon="add"
  :style=`{
    borderRadius: '50%',
  }`)
</template>

<script>
export default {
  name: 'nodeChainAdd',
  data () {
    return {
    }
  },
  methods: {
    start () {
      this.$log('start')
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
