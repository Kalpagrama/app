<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', opacity: 0.8,
    pointerEvents: 'none',
    userSelect: 'none',
  }`).row.full-width.bg-green.q-pa-xs
  div(
    v-for="(o,okey) in options" :key="oi"
    :style=`{fontSize: '11px', color: 'white'}`
    ).row.full-width
    small {{okey}}: "{{o}}"
</template>

<script>
export default {
  name: 'kalpaDebug',
  props: ['options'],
  data () {
    return {
    }
  }
}
</script>
