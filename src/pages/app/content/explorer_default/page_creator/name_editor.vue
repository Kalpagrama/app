<template lang="pug">
.row.full-width.justify-center.q-px-xl
  q-input(
    v-model="node.name"
    borderless dark color="white"
    type="textarea" autogrow
    placeholder="В чем суть?"
    :maxlength="120"
    :resize="false"
    :input-style=`{
      fontSize: fontSize+'px',
      //- fontWeight: 'bold',
      lineHeight: 1.1,
      textAlign: 'center',
    }`
    :style=`{}`
    ).full-width
</template>

<script>
export default {
  name: 'nameEditor',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 30
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  }
}
</script>
