<template lang="pug">
.column.fit
  div(v-if="false" :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm.bg-grey-3
    .col
    q-btn(flat color="grey-9" style=`height: 40px; width: 40px` icon="search")
    q-btn(flat color="grey-9" style=`height: 40px; width: 40px` icon="more_vert")
  div(body-scroll-lock-ignore).col.full-width.scroll.q-pt-sm
    //- div(v-for="n in 100" :key="n" :style=`{height: '300px'}`).row.full-width {{n}}
    node-list(:nodes="nodes")
</template>

<script>
import nodeList from 'components/node_list'

export default {
  name: 'sphereExplorer__nodes',
  props: ['nodes'],
  components: {nodeList},
  data () {
    return {
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
