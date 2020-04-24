<template lang="pug">
div(:style=`{minWidth: '300px'}`).column.fit.bg-grey-6
  div(:style=`{height: '35px'}`).row.full-width.items-center.content-center.q-px-md
    span.text-white.text-bold layer
  div(:style=`{height: '40px'}`).row.full-width.items-center.content-center.q-px-md
    span.text-white.text-bold Export layer
  div(
    :style=`{height: '40px'}` @click="layerDelete()"
    ).row.full-width.items-center.content-center.cursor-pointer.q-px-md
    span.text-red.text-bold Delete layer
</template>

<script>
export default {
  name: 'layerEditorActions',
  props: ['composition', 'layer', 'index'],
  data () {
    return {
    }
  },
  methods: {
    layerDelete () {
      this.$log('layerDelete', this.composition)
      if (!confirm('Delete layer?')) return
      this.$delete(this.composition.layers, this.index)
    }
  }
}
</script>
