<template lang="pug">
div(
  @mouseenter="mouseIsOver = true"
  @mouseleave="mouseIsOver = false"
  :style=`{
    width: resizable ? maxWidth+'px' : '100%',
    maxWidth: resizable ? maxWidth+'px' : '100%',
    background: 'rgba(50,50,50,0.9)',
    borderRadius: $store.state.ui.borderRadius+'px',
    //- overflow: 'hidden',
  }`
  ).row.full-height
  //- left menu for resize
  div(
    v-if="resizable"
    :style=`{width: '50px'}`
    ).row.full-height.items-start.content-start.q-pa-sm
    q-btn(
      @click="opened = !opened"
      round flat dense color="white"
      :icon="opened ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      )
    q-btn(
      v-for="(p,pi) in stateExplorer.pages" :key="p.id"
      @click="stateExplorer.set('pageId', p.id), opened = true"
      round flat dense
      :color="p.id === stateExplorer.pageId ? 'green' : 'white'"
      :icon="p.icon"
      :style=`{}`).full-width
  //- right body
  div(:style=`{}`).col.full-height
    .column.fit
      .col.full-width
        component(
          :is="'meta-'+stateExplorer.pageId"
          :stateExplorer="stateExplorer"
          :resizable="resizable")
      //- footer
      div(v-if="!resizable && !stateExplorer.compositionEditing").row.full-width.justify-center
        q-tabs(
          :value="stateExplorer.pageId" @input="pageIdChanged"
          dense no-caps color="white"
          active-color="green"
          :style=`{}`
          ).full-width
          q-tab(
            v-for="(p,pi) in stateExplorer.pages" :key="p.id"
            :name="p.id" :label="p.name"
            dense no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
</template>

<script>
import metaPeople from './meta_people'
import metaSpheres from './meta_spheres'
import metaChat from './meta_chat'
import metaInfo from './meta_info'
import metaCompositions from './meta_compositions'

export default {
  name: 'contentMeta',
  components: {metaChat, metaPeople, metaSpheres, metaInfo, metaCompositions},
  props: ['stateExplorer', 'resizable'],
  data () {
    return {
      mouseIsOver: false,
      opened: true,
      maxWidth: 500
    }
  },
  watch: {
    mouseIsOver: {
      handler (to, from) {
      }
    },
    resizable: {
      immediate: true,
      handler (to, from) {
        if (to) this.opened = true
      }
    },
    opened: {
      handler (to, from) {
        this.$log('opened TO', to)
        this.$tween.to(this, 0.3, {maxWidth: to ? 500 : 50})
      }
    }
  },
  methods: {
    pageIdChanged (e) {
      this.$log('pageIdChanged', e)
      this.stateExplorer.set('pageId', e)
    }
  }
}
</script>
