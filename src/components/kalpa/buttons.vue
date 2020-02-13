<template lang="pug">
.row.full-width.q-pa-sm
  //- TODO create CSS variable for #4caf50 color...
  span(
    v-for="(i, ii) in value" :key="i[idKey]" @click="$emit('id', i[idKey])"
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden',
      color: id === i[idKey] ? 'white !important' : '#4caf50',
      background: id === i[idkey] ? '#4caf50' : 'none'}`
    ).text-green.cursor-pointer.q-pa-sm {{id}}-{{ i.name }}-{{idKey}}
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
