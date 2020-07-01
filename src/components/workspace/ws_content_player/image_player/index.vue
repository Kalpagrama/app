<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.bg-black
  img(
    :src="content.url"
    draggable="false"
    :style=`{
      objectFit: 'contain',
    }`
    ).fit
</template>

<script>
export default {
  name: 'imagePlayer',
  props: ['content', 'options'],
  data () {
    return {
    }
  }
}
</script>
