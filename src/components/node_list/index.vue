<template lang="pug">
.row.full-width.items-start.content-start.justify-start
  div(
    v-for="(n, ni) in nodes" :key="n.oid" @click="nodeClick(n, ni)"
    :style=`{height: nodeHeight+'px'}`
    ).row.full-width.q-mb-sm.q-px-sm
    div(:style=`{height: nodeHeight+'px', width: nodeHeight*1.4+'px', borderRadius: '4px', overflow: 'hidden'}`).row.bg-black
      img(
        :src="n.meta.fragments[0].thumbUrl"
        :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
    .col.full-height
      .row.fit.items-center.q-px-md
        span {{ n.name | cut(50) }}
</template>

<script>
export default {
  name: 'nodeList',
  props: ['nodes', 'selected'],
  data () {
    return {
      nodeHeight: 50
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('nodeClick', n)
      // this.$router.push(`/app/node/${n.oid}`)
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
