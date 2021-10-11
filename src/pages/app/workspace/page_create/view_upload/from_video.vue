<template lang="pug">
.row.full-width
  video(
    :src="fileSrc"
    :style=`{
    }`
    ).full-width
</template>

<script>
export default {
  name: 'fromImage',
  props: ['file', 'fileSrc'],
}
</script>
