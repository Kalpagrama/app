<style lang="sass" scroped>
.my-style
  background: red
</style>

<template lang="pug">
.row.full-width
  h1.text-white {{ message }}
</template>

<script>
export default {
  name: 'myComponent',
  data () {
    return {
      message: 'Hello world'
    }
  },
  mounted () {
    this.$log('myComponent mounted')
  }
}
</script>
