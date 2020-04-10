<template lang="pug">
.column.bg-grey-9
  .row.full-width.q-pb-md
    .row.full-width.items-center.content-center.q-pl-xs.q-pr-md.q-py-sm
      q-btn(round flat color="green" icon="school")
      .col.full-height
        .row.fit.items-center.content-center
          span.text-white.text-bold Layers from your library by content:
      q-btn(round flat color="white" icon="clear" @click="$emit('hide')")
    div(:style=`{minHeight: '60px'}`).row.full-width
      .col.full-height
        div(:style=`{overflow: 'hidden'}`).row.fit.items-center.content-center.q-px-md.q-py-sm
          span.text-white {{ content.name }}
  .col.full-width.scroll.bg-grey-8
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(l,li) in layers" :key="li" @click="layerPick(l, li)"
        v-if="l.spheres.length > 0 && l.figuresAbsolute.length > 0"
        :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-mr-sm.q-mb-xs.q-px-sm.bg-grey-6.cursor-pointer
        span(v-if="l.spheres.length > 0").text-white {{ l.spheres[0].name }}
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
        return this.nodeContent.items[0].layers
      }
      else {
        return []
      }
    }
  },
  methods: {
    layerPick (l, li) {
      this.$log('layerPick', l, li)
      this.$emit('layerAdd', JSON.parse(JSON.stringify(l)))
    },
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
