<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`
  ).row.full-width.items-center.content-center.justify-center
  span.text-green debug
</template>

<script>
export default {
  name: 'pageAppDebug',
  data () {
    return {
    }
  }
}
</script>
