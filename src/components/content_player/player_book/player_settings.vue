<template lang="pug">
.row.full-width
  //- text size
  .row.full-width
    .col
    q-btn(round flat no-caps outline icon="close", color="green" @click="$emit('close')")
  span.full-width.text-white.q-px-xl {{$t('font size')}}
  q-slider(
    v-model="settings.fontSize"
    :min="50"
    :max="200"
    :step="10"
    snap
    label
    color="green"
  ).q-mx-xl

</template>

<script>
export default {
  name: 'playerSettings',
  props: {
    settings: {
      type: Object
    }
  }
}
</script>
