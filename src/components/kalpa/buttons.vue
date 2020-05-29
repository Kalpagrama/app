<style lang="sass" scoped>
.kalpa-button
  &:hover
    // background: rgb(114,114,114) !important
</style>

<template lang="pug">
div(:style=`{}`).row.items-center.content-center.q-pt-sm
  //- TODO create CSS variable for #4caf50 color...
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap.b-70
    div(
      v-for="(i, ii) in value" :key="i[idKey]" @click="$emit('id', i[idKey])"
      :class=`{
        'bg-green': id === i[idKey]
      }`
      :style=`{
        position: 'relative', borderRadius: '10px', overflow: 'hidden', userSelect: 'none',
        height: '36px',
        minWidth: '50px',
        color: id === i[idKey] ? 'white !important' : '#4caf50',}`
      ).row.items-center.content-center.justify-center.text-green.cursor-pointer.q-px-md.kalpa-button
      span.text-white {{ i.name }}
</template>

<script>
export default {
  name: 'kalpaButtons',
  props: {
    value: {
      type: Array
    },
    id: {
      type: String
    },
    idKey: {
      type: String,
      default () {
        return 'id'
      }
    }
  },
  data () {
    return {
    }
  }
}
</script>
