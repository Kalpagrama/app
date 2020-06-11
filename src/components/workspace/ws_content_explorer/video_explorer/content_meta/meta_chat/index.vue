<template lang="pug">
.row.fit.justify-center.q-py-md
  div(
    :style=`{
      position: 'relative',
      maxWidth: '600px',
    }`).column.fit
    //- header
    .row.full-width.q-px-sm
      .row.full-width.q-pa-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Chat
    //- body
    .col.full-width.scroll
    //- footer
    .row.full-width
      q-input(
        v-model="message"
        filled dark dense color="grey-6"
        label="Message"
        :style=`{}`
        ).full-width
</template>

<script>
export default {
  name: 'metaChat',
  data () {
    return {
      message: '',
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
