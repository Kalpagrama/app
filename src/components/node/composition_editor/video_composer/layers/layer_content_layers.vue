<template lang="pug">
.column.bg-grey-9
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      div(:style=`{overflow: 'hidden'}`).row.fit.items-center.content-center.q-px-md
        span.text-white {{ content.name }}
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="white" icon="clear" @click="$emit('hide')")
  .col.full-width.scroll
    .row.full-width.q-px-sm
      div(v-for="(l,li) in layers").row.full-width.items-center.content-center.q-mr-sm.q-px-md
        span.text-white {{li}}
</template>

<script>
export default {
  name: 'layerContentLayers',
  props: ['layer'],
  data () {
    return {
      nodeContent: null
    }
  },
  computed: {
    content () {
      return this.layer.content
    },
    layers () {
      if (this.nodeContent) {
        return this.nodeContent.compositions[0].layers
      }
      else {
        return []
      }
    }
  },
  methods: {
    async contentGet () {
      this.$log('contentGet')
      let name = 'CONTENT-' + this.content.oid
      let nodeContent = await this.$store.dispatch('workspace/get', {name})
      this.$log('nodeContent', nodeContent)
      this.nodeContent = nodeContent
    }
  },
  mounted () {
    this.$log('mounted')
    this.contentGet()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
