<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  containter
  :style=`{
    height: $q.screen.hight+'px',
  }`)
  q-page-container
    q-page
      .row.full-width
        h1.text-white collection
</template>

<script>
export default {
  name: 'pageCollection',
}
</script>
