<template lang="pug">
.row.full-width
  q-input(
    :value="layerName"
    ref="nameInput"
    filled dark dense color="grey-6"
    autofocus
    autogrow
    @input="nameInputChanged"
    @focus="nameInputFocused"
    @blur="nameInputBlurred"
    @keydown.enter="nameInputEntered"
    :style=`{
      borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)',
    }`
    ).full-width
    template(v-slot:prepend)
      small(:style=`{fontSize: '14px'}`).text-white {{ $time(stateLayerEditor.layerStart) }}:
    template(v-slot:append)
      q-btn(round flat dense color="grey-6")
        q-icon(name="edit" size="20px" color="grey-6")
</template>

<script>
export default {
  name: 'layerName',
  props: ['stateExplorer', 'stateLayerEditor'],
  data () {
    return {
    }
  },
  computed: {
    layerName () {
      if (this.stateLayerEditor.layer?.spheres.length > 0) return this.stateLayerEditor.layer.spheres[0].name
      else return ''
    },
  },
  methods: {
    nameInputEntered (e) {
      this.$log('nameInputEntered', e)
      if (e.ctrlKey) {
        // alert('NEW LAYER')
        this.$emit('add')
      }
    },
    nameInputChanged (e) {
      // this.$log('nameInputChanged', e)
      this.$set(this.stateLayerEditor.layer.spheres, 0, {name: e})
    },
    async nameInputFocused () {
      // this.$log('nameInputFocused')
    },
    nameInputBlurred () {
      // this.$log('nameInputBlurred')
    }
  }
}
</script>
