<template lang="pug">
.row.full-width.q-pa-xs
  q-input(
    v-model="status"
    type="textarea" autogrow dark
    borderless flat
    placeholder="Расскажи о себе"
    :input-style=`{
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
      padding: '12px',
      minHeight: '80px',
    }`
    ).full-width
</template>

<script>
export default {
  name: 'editStatus',
  data () {
    return {
      status: ''
    }
  }
}
</script>
