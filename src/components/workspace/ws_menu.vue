<template lang="pug">
div(
  :style=`{width: width+'px'}`
).row.full-height
  span wsMenu
</template>

<script>
export default {
  name: 'wsMenu',
  data () {
    return {
      width: 400
    }
  }
}
</script>
