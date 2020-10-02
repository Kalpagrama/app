<template lang="pug">
div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
  q-input(
    :value="value" @input="$emit('input', $event)"
    filled dark dense type="textarea" autogrow
    placeholder="Описание,  #сферы,  @упоминания"
    color="grey-8"
    :input-style=`{
      minHeight: '100px',
    }`
    :style=`{
      background: 'rgb(35,35,35)'
    }`
    ).full-width
</template>

<script>
export default {
  name: 'editDescription',
  props: ['value'],
  data () {
    return {
      description: '',
    }
  }
}
</script>
