<template lang="pug">
.row.full-width.br
  span cite from the book
</template>

<script>
export default {
  name: 'playerBook',
  props: ['composition'],
  data () {
    return {
    }
  },
  methods: {
    // setState (key, val) {},
    // play () {}
  },
  mounted () {
    this.$log('mounted')
  },
}
</script>
