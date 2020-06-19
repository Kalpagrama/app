<template lang="pug">
.row.fit.justify-center
  div(
    :style=`{
      maxWidth: '600px',
    }`
    ).column.fit.q-py-md
    div(:style=`{position: 'relative'}`).col.full-width.scroll
      div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.full-width.b-60
        ws-composition-editor(
          v-for="(i,ii) in node.items" :key="ii"
          :value="i"
          :options=`{
            usePlayer: true,
            useEditor: false,
            onlyProgress: false,
          }`
          :style=`{
            height: 400+'px',
            minHeight: 400+'px'
          }`)
      //- div(
      //-   :style=`{
      //-     height: '400px',
      //-     borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
      //-   ).row.full-width.items-center.content-center.justify-center.b-60
      //-   q-spinner(size="50px" color="green")
      //- node(
      //-   ctx="workspace"
      //-   :node="nodePreview" :nodeFullReady="nodePreview"
      //-   :visible="true" :active="true" :mini="false"
      //-   :style=`{
      //-     minHeight: '400px',
      //-   }`).fit
      .row.full-width.items-center.content-center.q-py-sm
        q-select(
          filled
          dark color="white" label="Layout"
          :value="layout(node.layout)" @input="layoutSelected"
          :options="layouts"
          :style=`{
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
            zIndex: 2000, transform: 'translate3d(0,0,0)',
          }`).full-width
    //- footer
    div(:style=`{}`).row.full-width.justify-center.br
      div(:style=`{maxWidth: '600px'}`).row.full-width.q-py-sm
        q-btn(
          round flat color="white"
          icon="keyboard_arrow_left"
          @click="stateNodeEditor.set('pageId', 'spheres')")
        .col
        q-btn(
          @click="stateNodeEditor.nodePublish()"
          push color="green" no-caps
          :loading="stateNodeEditor.nodePublishing"
          :style=`{height: '50px'}`).q-px-md
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
