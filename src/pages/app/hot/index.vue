<template lang="pug">
.row.full-width.bg-red
</template>

<script>
import nodeLoader from 'components/node_loader'

export default {
  name: 'pageApp__hot',
  components: { nodeLoader },
  data () {
    return {
      nodes: [],
      item: 'cats',
      items: {
        cats: {name: 'Кошечки'},
        mems: {name: 'Мемы'},
        pies: {name: 'Пирожки'}
      }
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
