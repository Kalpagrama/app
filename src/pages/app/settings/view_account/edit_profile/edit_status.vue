<template lang="pug">
div(
  :style=`{
    paddingBottom: '2px',
  }`
  ).row.full-width.q-px-xs
  q-input(
    v-model="status"
    type="textarea" autogrow dark
    borderless flat
    placeholder="Расскажи о себе"
    :input-style=`{
      background: 'rgb(45,45,45)',
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
