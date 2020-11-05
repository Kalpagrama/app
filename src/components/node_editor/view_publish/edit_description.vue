<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px !important
</style>

<template lang="pug">
div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px'}`).row.full-width
  q-input(
    v-model="node.description"
    :outlined="focused"
    :borderless="!focused"
    dark dense type="textarea" autogrow
    placeholder="Описание,  #сферы,  @упоминания"
    color="green"
    :input-style=`{
      minHeight: '100px',
      //- background: 'rgb(35,35,35)',
      paddingLeft: focused ? '0px' : '12px',
    }`
    :style=`{
      //- background: 'rgb(35,35,35)'
    }`
    @focus="focused = true"
    @blur="focused = false"
    ).full-width
</template>

<script>
export default {
  name: 'editDescription',
  props: ['node'],
  data () {
    return {
      focused: false,
    }
  }
}
</script>
