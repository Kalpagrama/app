<template lang="pug">
.row.full-width.q-pa-md
  .row.full-width
    span.text-bold.text-white Email
  .row.full-width.items-center.content-center.q-py-sm
    span(:style=`{marginBottom: '2px'}`).text-white.text-bold ivan@ivan.ru
    q-btn(
      @click="editing = true"
      flat dense color="grey-6" no-caps).q-mx-md.q-px-sm Change email
</template>

<script>
export default {
  name: 'emailEditor',
  data () {
    return {
      editing: true,
    }
  }
}
</script>
