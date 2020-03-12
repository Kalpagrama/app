<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
.kbtn {
  border-radius: 10px
}
</style>

<template lang="pug">
.column.fit
  //- dialogs
  //- layerName
  q-dialog(v-model="layerNameDialogOpened" :maximized="$q.screen.xs" @hide="layerNameSet")
    div(
      :style=`{
        maxHeight: $q.screen.xs ? '100%' : '200px',
        maxWidth: $q.screen.xs ? '100%' : '300px',
        borderRadius: '10px'
      }`).column.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
        span.text-bold.text-black Set layer name
      div(:style=`{height: '60px'}`).row.full-width.q-px-sm
        input(
          v-model="layerName"
          autofocus placeholder="Suggest layer name"
          @keyup.enter="layerNameSet"
          :style=`{borderRadius: '10px'}`).kinput.full-width.bg-grey-4
      .col.full-width
      div(:style=`{height: '70px'}`).row.full-width.q-pa-sm
        q-btn(push color="green" no-caps @click="layerNameSet"
          :style=`{borderRadius: '10px'}`).fit
          span Save
  //- div(:style=`{height: '60px'}`).row.full-width.items-center
  .row.full-width.q-px-sm
    small.text-white {{meta}}
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      layer(
        v-for="(l, li) in layers" :key="li"
        v-if="l.figuresAbsolute.length > 0"
        :index="li" :layer="l" :player="player" :meta="meta"
        @layerNameSetStart="layerNameSetStart"
        @layerDelete="layerDelete"
        @meta="$emit('meta', $event)")
</template>

<script>
import layer from './layer'

export default {
  name: 'videoComposerLayers',
  components: { layer },
  props: ['layers', 'player', 'meta'],
  data () {
    return {
      layerNameDialogOpened: false,
      layerNameSetIndex: -1,
      layerName: ''
    }
  },
  computed: {
  },
  methods: {
    layerNameSetStart (index) {
      this.$log('layerNameSetStart', index)
      this.layerNameSetIndex = index
      let layer = this.layers[index]
      if (layer.spheres.length > 0) {
        this.layerName = layer.spheres[0].name
      }
      this.layerNameDialogOpened = true
    },
    layerNameSet () {
      this.$log('layerNameSet', this.layerNameSetIndex)
      this.layerNameDialogOpened = false
      if (this.layerName.length === 0) return
      this.$set(this.layers[this.layerNameSetIndex].spheres, 0, {name: this.layerName})
      this.layerName = ''
      this.layerNameSetIndex = -1
    },
    async layerDelete (i) {
      this.$log('layerDelete', i)
      if (this.layers.length > 1) {
        if (!confirm('Delete layer?')) return
        let index = i === 0 ? this.meta.layerIndex + 1 : this.meta.layerIndex - 1
        this.$emit('meta', ['mode', 'layer'])
        this.$emit('meta', ['layerIndex', index])
        this.$emit('meta', ['layerIndexPlay', index])
        this.$wait(300).then(() => {
          this.$delete(this.layers, i)
        })
      }
    }
  }
}
</script>
