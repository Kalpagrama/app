<template lang="pug">
.row.full-width
  span content: {{content}}
</template>

<script>
export default {
  name: 'contentInfo',
  props: ['content']
}
</script>
