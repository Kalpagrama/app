<template lang="pug">
.row.full-width.br
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`
    ).full-width.br
</template>

<script>
export default {
  name: 'typeImage',
  props: ['item'],
  data () {
    return {}
  }
}
</script>
