
<template lang="pug">
div(
  :style=`{
    paddingTop: '0px'
  }`).row.full-width.items-start.content-start.justify-center
  .row.full-width.items-center.content-center.justify-start.q-pa-sm
    .col
      span().text-grey-7.text-bold.q-ml-xs.q-mr-xs Другие смыслы
      span(v-if="nodesLoaded").text-grey-7.text-bold - 123
    q-btn(
      round flat color="grey-7" icon="tune")
</template>

<script>
export default {
  name: 'pageNames',
}
</script>
