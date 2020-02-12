<template lang="pug">
div(
  :style=`{
    position: 'relative',
    maxWidth: ctx === 'workspace' ? width+'px' : '100%',
  }`
  ).row.fit
  //- toggle opened
  q-btn(
    v-if="ctx === 'workspace'"
    round push color="green" @click="opened = !opened"
    :icon="width === 0 ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
    :style=`{position: 'absolute', zIndex: 2000, right: width === 0 ? '-60px' : '-22px', top: '50%'}`)
  //- column, borderRight: '1px solid #4caf50',
  div(
    :style=`{position: 'relative', overflow: 'hidden'}`
    ).column.fit
    //- header
    div(
      v-show="ctx === 'workspace' && width > 200"
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="green" icon="school")
      .col.full-height
        .row.fit.items-center
          span.text-bold.text-green Workspace
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round :flat="page !== 'spheres'" color="green" icon="style" @click="$emit('page', 'spheres')")
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round :flat="page !== 'settings'" color="green" icon="settings" @click="$emit('page', 'settings')")
    //- pages
    div(v-show="width > 390").row.full-width.q-pa-sm
      span(
        v-for="(p,pi) in pagesFiltered" :key="p.id" @click="$emit('page', p.id)"
        :style=`{
          borderRadius: '10px',
          color: page === p.id ? 'white !important' : '#4caf50',
          background: page === p.id ? '#4caf50' : 'none'}`
        ).text-green.cursor-pointer.q-pa-sm {{ p.name }}
    //- body
    div(v-show="width > 390").col.full-width
      component(:is="`ws-`+page" @item="itemClick('note', $event)" :ctx="ctx" :oid="oid")
      //- ws-notes(v-if="page === 'notes'" @item="itemClick('note', $event)" :ctx="ctx" :oid="oid")
      //- ws-contents(v-if="page === 'contents'" @item="itemClick('content', $event)" :ctx="ctx" :oid="oid")
      //- ws-compositions(v-if="page === 'compositions'" @item="itemClick('composition', $event)" :ctx="ctx" :oid="oid")
      //- ws-nodes(v-if="page === 'nodes'" @item="itemClick('node', $event)" :ctx="ctx" :oid="oid")
      //- ws-spheres(v-if="page === 'spheres'" @item="itemClick('sphere', $event)" :ctx="ctx")
      //- ws-settings(v-if="page === 'settings'")
</template>

<script>
import wsNotes from './ws_notes'
import wsContents from './ws_contents'
import wsCompositions from './ws_compositions'
import wsNodes from './ws_nodes'
import wsSpheres from './ws_spheres'
import wsSettings from './ws_settings'

export default {
  name: 'wsMenu',
  components: {wsNotes, wsContents, wsCompositions, wsNodes, wsSpheres, wsSettings},
  props: {
    page: {
      type: String
    },
    oid: {
      type: String
    },
    ctx: {
      type: String,
      default () {
        return 'workspace'
      }
    },
    pages: {
      type: Array,
      default () {
        return ['notes', 'contents', 'compositions', 'nodes']
      }
    }
  },
  data () {
    return {
      opened: true,
      width: 400,
      // page: 'contents',
      pagesRaw: [
        {id: 'notes', name: 'Notes'},
        {id: 'contents', name: 'Contents'},
        {id: 'compositions', name: 'Compositions'},
        {id: 'nodes', name: 'Nodes'}
      ],
      nodes: []
    }
  },
  computed: {
    pagesFiltered () {
      return this.pagesRaw.filter(p => this.pages.includes(p.id))
    }
  },
  watch: {
    opened: {
      handler (to, from) {
        this.$log('opened CHANGED', to)
        this.$tween.to(this, 0.4, {width: to ? 400 : 0})
      }
    }
  },
  methods: {
    itemClick (type, item) {
      this.$log('itemClick', type, item)
      // TODO: switch mode READ, EDIT, DELETE, SELECT
      // emit, item: {type: 'NODE', item: {}} types: NODE, COMPOSITION, SPHERE, LAYER, NOTE
      // this.$emit('node', JSON.parse(JSON.stringify(item)))
      // this.$emit()
      this.$emit('item', {type: type, item: JSON.parse(JSON.stringify(item))})
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
