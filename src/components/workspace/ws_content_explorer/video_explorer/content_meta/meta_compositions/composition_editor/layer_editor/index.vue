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
    div(:style=`{height: '70px'}`).row.full-width.items-center.content-center.br
      div(:style=`{height: '40px'}`).row.full-width.b-90.bg
    //- progress: start, end, duration
    .row.full-width.q-py-sm.br
      div(:style=`{position: 'relative', height: '20px', borderRadius: '10px',}`).row.full-width.b-80
        div(
          :style=`{
            position: 'absolute',
            zIndex: 100,
            borderRadius: '10px',
            overflow: 'hidden',
          }`).row.fit
          div(
            :style=`{position: 'absolute', zIndex: 110, left: '0px', width: '33%'}`).row.full-height.bg-grey-5
            div(:style=`{position: 'absolute', zIndex: 120, right: '-2px', width: '2px'}`).row.full-height.bg-green
    //- actions: play, refresh, 2 x (cut + ticks)
    div(
      ).row.full-width.q-py-xs.br
      q-btn(round flat dense color="white" icon="play_arrow")
      q-btn(round flat dense color="white" icon="refresh")
      .col
  //- name
  div(
    :style=`{height: '40px'}`
    ).row.full-width
    q-input(
      :value="layerName"
      @input="nameInputChanged"
      @keydown.enter="nameInputEntered"
      filled dense dark color="grey-6"
      ).full-width
      template(v-slot:prepend)
        q-btn(
          round flat dense color="grey-6" no-caps
          ) {{ $time(layerStart) }}
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
    }
  },
  computed: {
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    }
  },
  methods: {
    nameInputChanged (e) {
      // this.$log('nameInputChanged', e)
      this.$set(this.layer.spheres, 0, {name: e})
    },
    nameInputEntered (e) {
      this.$log('nameInputEntered', e)
      if (e.ctrlKey) {
        // alert('NEW LAYER')
        this.$emit('add')
      }
    }
  }
}
</script>
