<template lang="pug">
//- .column.fit
//-   k-menu
</template>

<script>
import kMenu from 'components/kMenu'

export default {
  name: 'pageApp__Menu',
  components: { kMenu },
  props: {
    mini: {type: Boolean}
  },
  data () {
    return {
    }
  },
  methods: {
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
