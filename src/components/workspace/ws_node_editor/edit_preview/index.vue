<template lang="pug">
.row.fit.justify-center
  div(
    :style=`{
      maxWidth: '600px',
    }`
    ).column.fit.q-py-md
    div(:style=`{position: 'relative'}`).col.full-width.scroll
      div(
        :style=`{
          height: '400px',
          borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.justify-center.b-60
        q-spinner(size="50px" color="green")
      //- node(
      //-   ctx="workspace"
      //-   :node="nodePreview" :nodeFullReady="nodePreview"
      //-   :visible="true" :active="true" :mini="false"
      //-   :style=`{
      //-     minHeight: '400px',
      //-   }`).fit
      .row.full-width.items-center.content-center.q-py-sm
        .col.q-pr-sm
          q-select(
            filled
            dark color="white" label="Layout"
            :value="layout(node.layout)" @input="layoutSelected"
            :options="layouts"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              zIndex: 2000, transform: 'translate3d(0,0,0)',
            }`).full-width
        q-btn(
          @click="stateNodeEditor.nodePublish()"
          push color="green" no-caps
          :loading="stateNodeEditor.nodePublishing"
          :style=`{height: '56px'}`).q-px-md
          span.text-white.text-bold Publish
</template>

<script>
export default {
  name: 'editPreview',
  props: ['node', 'stateNodeEditor'],
  data () {
    return {
      nodePublishing: false,
      layouts: [
        {value: 'PIP', label: 'Picture in picture'},
        {value: 'HORIZONTAL', label: 'Compare'},
        {value: 'SLIDER', label: 'Slider'}
      ]
    }
  },
  computed: {
    nodePreview () {
      return {
        layout: 'PIP',
        name: this.node.name,
        items: this.node.items,
        spheres: this.node.spheres,
        category: this.node.category,
        author: null
      }
    }
  },
  methods: {
    layout (val) {
      return this.layouts.find(l => l.value === val)
    },
    layoutSelected (e) {
      this.$log('layoutSelected', e)
      this.node.layout = e.value
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
