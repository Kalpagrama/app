<template lang="pug">
div(:style=`{minWidth: '300px', minHeight: '300px'}`).column.fit.bg-grey-6
  div.row.full-width.q-pa-sm
    q-input(
      v-model="nameInput" filled color="white" dark
      placeholder="Set layer name"
      @blur="onBlur"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).full-width
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(s,si) in layer.spheres" :key="si"
        :style=`{}`).q-px-sm.q-py-xs
        small.text-white {{ s.name }}
</template>

<script>
export default {
  name: 'extraLayers-layerEditorSpheres',
  props: ['layer'],
  data () {
    return {
      nameInput: ''
    }
  },
  methods: {
    onBlur () {
      if (this.nameInput.length > 0) {
        // this.layer.spheres[0] = {name: this.nameInput}
        this.$set(this.layer.spheres, 0, {name: this.nameInput})
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.layer && this.layer.spheres.length > 0) {
      this.nameInput = this.layer.spheres[0].name
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
