<template lang="pug">
div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width
  q-input(
    v-model="node.name"
    dark color="white"
    :placeholder="$t('what_the_essence', 'В чем суть?')"
    autogrow
    :input-style=`{
      minHeight: '60px',
      padding: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
    }`
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).full-width.text-bold
</template>

<script>
export default {
  name: 'editEssence',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
