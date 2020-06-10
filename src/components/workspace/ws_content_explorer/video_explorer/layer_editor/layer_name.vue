<template lang="pug">
.column.fit.q-py-sm
  .row.full-width.q-px-sm
    q-input(
      :value="layerName"
      ref="nameInput"
      filled dark color="grey-5"
      label="What do you see?"
      autogrow
      @input="nameInputChanged"
      @focus="nameInputFocused"
      @blur="nameInputBlurred"
      :input-style=`{
        minHeight: '90px',
      }`
      :style=`{
        borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)',
      }`
      ).full-width.b-50
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
      if (this.stateExplorer.layer?.spheres.length > 0) return this.stateExplorer.layer.spheres[0].name
      else return ''
    },
  },
  methods: {
    nameInputChanged (e) {
      this.$log('nameInputChanged', e)
      this.$set(this.stateExplorer.layer.spheres, 0, {name: e})
    },
    async nameInputFocused () {
      this.$log('nameInputFocused')
      if (this.stateExplorer.layer) {
      }
      else {
        this.stateExplorer.set('layerSelected', await this.stateExplorer.layerAdd())
        this.$nextTick(() => {
          this.$refs.nameInput.focus()
        })
      }
    },
    nameInputBlurred () {
      this.$log('nameInputBlurred')
    }
  }
}
</script>
