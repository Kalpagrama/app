<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- header
  //- body
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    div(
      :style=`{
        position: 'relative', height: '400px',
        borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
      ).row.full-width.b-60
      list-pip(
        v-if="node.layout === 'PIP'"
        :items="node.items")
        template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
          div(:style=`{position: 'relative'}`).row.fit
            div(
              v-if="!itemActive"
              :style=`{position: 'absolute', zIndex: 999, borderRadius: '10px', overflow: 'hidden', opacity: 0.2}` @click="next()").row.fit.cursor-pointer.bg-green
            ws-composition-editor(
              :sid="`wce-${itemIndex}`"
              :value="item"
              :options=`{
                isPreview: true,
                mode: 'player',
                mini: !itemActive,
                active: itemActive,
              }`
              :style=`{
                height: '100%',
              }`)
      list-horizontal(
        v-if="node.layout === 'HORIZONTAL'"
        :items="node.items")
        template(v-slot:item=`{item,itemIndex,itemActive}`)
          ws-composition-editor(
            :sid="`wce-${itemIndex}`"
            :value="item"
            :options=`{
              isPreview: true,
              mode: 'player',
              mini: !itemActive,
              active: itemActive,
            }`
            :style=`{
              height: '100%',
            }`)
    //- layout
    div(v-if="true").row.full-width.items-center.content-center.q-py-sm
      q-select(
        filled
        dark color="white"
        :label="$t('node_editor_choose_layout', 'Выбери шаблон')"
        :value="layout(node.layout)" @input="layoutSelected"
        :options="layouts"
        :style=`{
          borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
          zIndex: 2000, transform: 'translate3d(0,0,0)',
        }`).full-width
    //- actions
    .row.full-width
      q-btn(
        @click="storeNodeEditor.publish()"
        push no-caps color="green"
        :loading="storeNodeEditor.publishing"
        :style=`{height: '60px'}`
        ).full-width {{ $t('node_publish', 'Опубликовать')}}
</template>

<script>
export default {
  name: 'editPreview',
  props: ['node', 'storeNodeEditor'],
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
