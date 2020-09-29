<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.fit.b-40.shadow-10
  //- small.text-white {{ item }}
  img(
    :src="item.thumbUrl"
    draggable="false"
    :style=`{objectFit: 'cover'}`
    ).fit
</template>

<script>
export default {
  name: 'editItem',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
