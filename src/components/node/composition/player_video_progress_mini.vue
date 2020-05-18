<template lang="pug">
.row.full-width
  div(:style=`{position: 'relative', height: '20px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
    div(
      :style=`{
        position: 'absolute', bottom: '0px', zIndex: 30000, left: '0px',
        width: ((meta.now / meta.duration) * 100) + '%',
        height: '4px', borderRadius: '2px', overflow: 'hidden',
        pointerEvents: 'none'
      }`
    ).bg-green
</template>

<script>
export default {
  name: 'playerVideoProgressMini',
  props: ['player', 'meta'],
  data () {
    return {
    }
  }
}
</script>
