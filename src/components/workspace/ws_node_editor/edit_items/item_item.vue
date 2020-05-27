<template lang="pug">
.row.full-width
  span.text-white {{item}}
</template>

<script>
export default {
  name: 'editItems-itemItem',
  props: ['node', 'item'],
  data () {
    return {
    }
  }
}
</script>
