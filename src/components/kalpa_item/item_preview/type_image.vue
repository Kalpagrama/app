<template lang="pug">
.row.full-width
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`
    ).full-width
</template>

<script>
export default {
  name: 'typeImage',
  props: ['item'],
  data () {
    return {}
  },
  mounted () {
    this.$log('mounted', this.item)
  }
}
</script>
