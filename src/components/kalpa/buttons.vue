<template lang="pug">
div(:style=`{height: '60px'}`).row.items-center.content-center
  //- TODO create CSS variable for #4caf50 color...
  div(
    v-for="(i, ii) in value" :key="i[idKey]" @click="$emit('id', i[idKey])"
    :class=`{
      'bg-green': id === i[idKey]
    }`
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden', userSelect: 'none',
      height: '42px',
      color: id === i[idKey] ? 'white !important' : '#4caf50',}`
    ).row.items-center.content-center.text-green.cursor-pointer.q-px-sm.q-mr-sm
    span {{ i.name }}
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
