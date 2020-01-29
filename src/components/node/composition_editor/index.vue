<template lang="pug">
.row.full-width
  span.bg-green composition editor
  //- get content
  //- so we got the outputType
  //- create first layer
</template>

<script>
export default {
  name: 'compositionEditor',
  data () {
    return {
      composition: {},
      compositionVideo: {
        layers: [
          {
            content: {},
            figures: [{points: [], t: 0}, {points: [], t: 10}],
            url: ''
          },
          {
            content: {},
            figures: [{points: [], t: 0}, {points: [], t: 10}],
            url: ''
          }
        ],
        outputType: 'VIDEO',
        operation: {
          items: [0],
          operations: null,
          type: 'CONCAT'
        }
      },
      compositionImage: {
        layers: [
          {
            content: {},
            figures: []
          },
          {
            content: {},
            figures: []
          }
        ],
        outputType: 'IMAGE',
        operation: {
          items: [0, 1],
          operations: [],
          type: 'OVERLAY'
        }
      }
    }
  },
  watch: {
    composition: {
      handler (to, from) {
        this.$log('composition CHANGED', to)
      }
    }
  },
  methods: {
    layerAdd () {
      this.$log('layerAdd')
    },
    layerDelete () {
      this.$log('layerDelete')
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
