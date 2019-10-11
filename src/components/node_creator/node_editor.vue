<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- body
  div(:style=`{position: 'relative', paddingBottom: '180px'}` body-scroll-lock-ignore).col.scroll.q-px-sm
    //- node for preview
    node(
      :node="node" :nodeFullReady="node" inCreator
      :noActions="true" :noTimestamp="true"
      :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).bg-white.q-my-sm
    div(:style=`{zIndex: 10, marginTop: '-20px', borderRadius: '0 0 10px 10px', opacity: 0.8}`).row.full-width.items-end.bg-grey-2.q-pa-sm.q-pt-md.q-mb-sm
      //- name
      div(:style=`{height: '40px'}`).row.full-width.items-end.q-px-sm.q-mt-sm
        span.text-bold Суть
      .row.full-width.q-py-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden', position: 'relative', zIndex: 100}`).row.full-width
          q-input(:value="node.name" filled type="textarea" rows="3" placeholder="В чем суть?" @input="$emit('update', 'name', $event)").full-width
      node-editor-meta(:value="node.meta" @input="$emit('update', 'meta', $event)")
      node-editor-categories(:value="node.categories" @input="$emit('update', 'categories', $event)")
      node-editor-spheres(:value="node.spheres" @input="$emit('update', 'spheres', $event)")
  //- footer
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    div(v-if="showPublish" :style=`{position: 'absolute', bottom: '0px', height: '76px'}`).row.full-width.items-center.content-center.q-px-sm
      k-menu-popup(ref="prePublishDialog" :noName="true" :actions="publishActions" @action="publishAction").full-width
      q-btn(
        no-caps color="primary" @click="$refs.prePublishDialog.toggle()"
        :loading="nodePublishing"
        style=`height: 60px; borderRadius: 10px`).full-width
        span.text-bold.text-white Опубликовать
</template>

<script>
import nodeEditorCategories from './node_editor_categories'
import nodeEditorSpheres from './node_editor_spheres'
import nodeEditorMeta from './node_editor_meta'

export default {
  name: 'nodeCreator__nodeEditor',
  components: {nodeEditorCategories, nodeEditorSpheres, nodeEditorMeta},
  props: ['node', 'nodePublishing'],
  data () {
    return {
      publishActions: [
        {id: 'sure', name: 'Опубликовать?'}
      ]
    }
  },
  computed: {
    showPublish () {
      if (this.node.name.length > 0) return true
      else return false
    }
  },
  methods: {
    publishAction ({id}) {
      this.$log('publishAction', id)
      switch (id) {
        case 'sure': {
          this.$log('publish')
          this.$emit('publish')
          break
        }
      }
    }
  },
  mounted () {
    this.$log('monted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
