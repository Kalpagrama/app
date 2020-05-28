<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 2000, height: '77px', bottom: '0px', pointerEvents: 'none',
    borderRadius: '10px', overflow: 'hidden',
    background: 'rgb(0,0,0)',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 100%)'
  }`).row.full-width
</template>

<script>
export default {
  name: 'playerVideo-progressTint'
}
</script>
