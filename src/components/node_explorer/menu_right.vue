<template lang="pug">
.column.fit.bg-grey-9
  .col.full-width.scroll
</template>

<script>
// different modes of nodeExplorer page
// pages: explore, chains, people, content, edit(fork...)

export default {
  name: 'nodeExplorer-menuRight',
  data () {
    return {
      pageId: null,
      pages: []
    }
  }
}
</script>
