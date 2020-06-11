<template lang="pug">
div(
  :class=`{
    'q-pa-sm': active,
    'b-70': active,
  }`
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-end
  div(
    v-if="active"
    ).row.full-width
    //- frames
    div(:style=`{height: '70px'}`).row.full-width.bg-red
    //- progress: start, end, duration
    div(:style=`{height: '40px', borderRadius: '10px',}`).row.full-width.b-70
    //- actions: play, refresh, 2 x (cut + ticks)
    div(
      ).row.full-width.q-py-xs
      q-btn(round flat dense color="white" icon="play_arrow")
      .col
  //- name
  div(
    :style=`{height: '40px'}`
    ).row.full-width
    q-input(
      v-model="name"
      filled dense dark color="grey-6"
      ).full-width
      template(v-slot:append)
        q-btn(
          @click="active = !active"
          round flat dense
          :color="active ? 'green' : 'grey-6'"
          :icon="active ? 'check' : 'edit'")
</template>

<script>
export default {
  name: 'layerEditor',
  props: ['stateExplorer', 'layer'],
  data () {
    return {
      active: false,
      name: 'some layer name'
    }
  }
}
</script>
