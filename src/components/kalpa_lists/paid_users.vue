<template lang="pug">
div(:style=`{
  maxWidth: $store.state.ui.pageWidth+'px',
  borderRadius: '20px',
  }`
  ).row.full-width.b-40.fit.q-pa-lg.relative-position
  q-btn(flat round icon="close" color="white" size="md" @click="$emit('close')").absolute-top-right
  .row.full-width.justify-center
    span.text-white.text-subtitle2 {{$t('Список оплативших')}}

  slot(name="buttons")
</template>

<script>
export default {
  name: 'paid_users',
}
</script>
