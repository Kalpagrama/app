<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30.br
  q-page-container
    q-page
      .row.full-width
        h1.text-white collections
</template>

<script>
export default {
  name: 'pageCollections',
}
</script>
