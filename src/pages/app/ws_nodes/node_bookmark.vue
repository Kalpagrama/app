<template lang="pug">
.row.full-width.items-start.content-start.br
  small.text-white {{ node }}
</template>

<script>
export default {
  name: 'nodeBookmark',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
