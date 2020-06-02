<template lang="pug">
layer-list(
  ref="layerList"
  mode="workspace"
  :contentOid="composition.contentOid"
  :actions="layerActions"
  @pick="layerPick"
  )
  template(v-slot:headerSelected=`{layersSelected}`)
    .row
      q-btn(dense no-caps color="green" @click="layersSelectedPick(layersSelected)").q-px-sm Pick
</template>

<script>
import layerList from '../layer_list'

export default {
  name: 'layersWorkspace',
  components: {layerList},
  props: ['composition'],
  data () {
    return {
      searchString: '',
      layersSelected: [],
      content: null
    }
  },
  computed: {
    layerActions () {
      return {
        pick: {
          name: 'Pick',
          fn: (layer) => {
            this.layerPick(layer)
          }
        }
      }
    }
  },
  watch: {
  },
  methods: {
    layerPick (layer) {
      this.$log('layerPick', layer)
      this.$emit('pick', JSON.parse(JSON.stringify(layer)))
    },
    layersSelectedPick (arr) {
      this.$log('layersSelectedPick', arr)
      this.composition.layers.map((l, li) => {
        if (arr.includes(l.id)) this.layerPick(l)
      })
      this.$refs.layerList.layersSelectedDrop()
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
