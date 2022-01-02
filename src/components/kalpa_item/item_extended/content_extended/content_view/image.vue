// образы на суть
<template lang="pug">
.row.full-width
</template>

<script>

export default {
  name: 'pageContentVideo',
  components: {},
  props: ['content', 'isFullscreen', 'isActive'],
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
  },
  async created () {
    this.$log('created ')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
