<template lang="pug">
q-layout(view='hHh Lpr fFf' :container="true")
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('back')")
      .col.full-height
        .row.fit.items-center.justify-center.q-px-md
          span.text-bold.text-white {{$t('Предосмотр')}}
      //- .col
      q-btn(round flat color="white" icon="more_vert")
  q-page-container
    //- body
    div(:style=`{position: 'relative', paddingBottom: '180px'}` body-scroll-lock-ignore).col.scroll.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
        //- node for preview
        node(
          :node="node" :nodeFullReady="node" inCreator
          :noActions="true" :noTimestamp="true"
          :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).bg-white
        div(:style=`{zIndex: 10, marginTop: '-20px', borderRadius: '0 0 10px 10px', opacity: 0.8}`).row.full-width.items-end.q-pa-sm.q-pt-md.q-mb-sm
          //- name label
          div(:style=`{height: '40px'}`).row.full-width.items-end.q-px-sm.q-mt-sm
            span.text-bold {{$t('В чем суть?')}}
          //- name input
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
      div(v-if="showPublish" :style=`{position: 'fixed', zIndex: 10000, bottom: '0px', height: '76px'}`).row.full-width.items-center.content-center.q-px-sm
        k-menu-popup(ref="prePublishDialog" :noName="true" :actions="publishActions" @action="publishAction").full-width
        q-btn(
          no-caps color="accent" @click="$refs.prePublishDialog.toggle()"
          :loading="nodePublishing"
          style=`height: 60px; borderRadius: 10px`).full-width
          span.text-bold.text-white {{$t('Опубликовать')}}
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
      this.$logD('publishAction', id)
      switch (id) {
        case 'sure': {
          this.$logD('publish')
          this.$emit('publish')
          break
        }
      }
    }
  },
  mounted () {
    this.$logD('monted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
