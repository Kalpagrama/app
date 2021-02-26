<template lang="pug">
.row.full-width
  template(v-slot:prepend)
    slot(name="prepend")
  h1.text-white rating
</template>

<script>
export default {
  name: 'pageWeight',
  props: ['user'],
  data () {
    return {
    }
  }
}
</script>
