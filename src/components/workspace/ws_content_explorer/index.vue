<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).column.full-width.bg-red
  h1 hello
</template>

<script>
export default {
  name: 'wsContentExplorer',
  data () {
    return {
      opened: true
    }
  }
}
</script>
