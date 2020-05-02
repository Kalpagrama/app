<template lang="pug">
div(:style=`{minWidth: '300px', minHeight: '300px'}`).column.fit.bg-grey-6
  //- header
  div.row.full-width.q-pa-sm
    q-input(
      ref="nameInput"
      v-model="nameInput" filled color="white" dark
      placeholder="Set layer name"
      @blur="onBlur"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).full-width.bg-grey-5
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(s,si) in layer.spheres" :key="si"
        :style=`{}`).q-px-sm.q-py-xs
        small.text-white {{ s.name }}
  //- footer
  div(:style=`{}`).row.full-width.items-center.items-center.content-center.q-pa-sm
    q-btn(
      push no-caps color="green" @click="$emit('ready')"
      :style=`{height: '50px'}`).full-width Ready
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
  async mounted () {
    this.$log('mounted')
    if (this.layer && this.layer.spheres.length > 0) {
      this.nameInput = this.layer.spheres[0].name
    }
    await this.$wait(400)
    this.$refs.nameInput.focus()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
