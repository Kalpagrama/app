<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).column.fit
  div().row.full-width.q-pa-md
    span.text-white.text-bold {{$t('Account')}}
  .col.full-width.scroll
    .row.full-width.text-white.q-pa-md
      span name
      span avatar
      //- span name
</template>

<script>
export default {
  name: 'settings-pageAccount',
  data () {
    return {
    }
  }
}
</script>
