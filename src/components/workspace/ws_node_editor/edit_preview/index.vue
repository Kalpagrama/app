<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- header
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.full-width.b-60
      //- v-for="(i,ii) in node.items" :key="ii"
      ws-composition-editor(
        v-if="node.items.length > 0"
        :value="node.items[0]"
        :options=`{
          isPreview: true,
          mode: 'player',
        }`
        :style=`{
          height: 400+'px',
          minHeight: 400+'px'
        }`)
      div(
        v-else
        :style=`{height: '400px'}`).row.full-width.items-center.content-center.justify-center
        q-spinner(color="green" size="50px")
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
</template>

<script>
export default {
  name: 'editPreview',
  props: ['node', 'stateNodeEditor'],
  data () {
    return {
      nodePublishing: false,
      layouts: [
        {value: 'PIP', label: 'Картинка в картинке'},
        {value: 'HORIZONTAL', label: 'Сравнение'},
        {value: 'SLIDER', label: 'Карусель'}
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
