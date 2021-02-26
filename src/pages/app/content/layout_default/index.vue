<template lang="pug">
.row.full-width.q-pa-md
  small.text-white {{ contentKalpa }}
</template>

<script>
export default {
  name: 'layoutDefault',
  props: ['contentKalpa'],
}
</script>
