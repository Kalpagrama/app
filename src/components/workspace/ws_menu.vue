<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).row.fit
  //- toggle opened
  q-btn(
    v-if="false && ctx === 'workspace' && $q.screen.gt.xs"
    round push color="green" @click="opened = !opened"
    :icon="width === 0 ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
    :style=`{position: 'absolute', zIndex: 2000, right: width === 0 ? '-60px' : '-22px', top: '70%'}`).gt-sm
  div(
    :style=`{position: 'relative', overflow: 'hidden'}`
    ).column.fit
    //- //- header for WS
    //- div(
    //-   v-if="ctx === 'workspace'"
    //-   :style=`{height: '60px'}`
    //-   ).row.full-width.items-center.content-center.justify-center
    //-   div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px'}`).row.full-width
    //-     div(
    //-       :style=`{height: '60px', width: '60px'}`
    //-       ).row.items-center.justify-center
    //-       q-btn(round flat color="green" icon="school")
    //-     .col.full-height
    //-       .row.fit.items-center.content-center
    //-         span.text-bold.text-green Workspace
    //-     div(
    //-       :style=`{height: '60px', width: '60px'}`
    //-       ).row.items-center.justify-center
    //-       q-btn(round :flat="page !== 'sphere'" color="green" icon="style" @click="$emit('page', 'sphere')")
    //-     div(
    //-       :style=`{height: '60px', width: '60px'}`
    //-       ).row.items-center.justify-center
    //-       q-btn(round :flat="page !== 'setting'" color="green" icon="settings" @click="$emit('page', 'setting')")
    //- pages
    div(v-if="true" :style=`{}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        kalpa-buttons(:value="pagesFiltered" :id="page" idKey="id" @id="$emit('page', $event)")
    //- body
    .col.full-width
      .row.fit.justify-center
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit
          component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add', $event)" :ctx="ctx")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
import wsCompositionList from './ws_composition_list'
import wsNodeList from './ws_node_list'
import wsSphereList from './ws_sphere_list'
// import wsSettingList from './ws_setting_list'

export default {
  name: 'wsMenu',
  components: {wsNoteList, wsContentList, wsCompositionList, wsNodeList, wsSphereList},
  props: {
    page: {
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
        return ['note', 'content', 'composition', 'node']
      }
    }
  },
  data () {
    return {
      opened: true,
      maxWidth: 700,
      width: 350,
      pagesRaw: [
        {id: 'note', name: 'Notes'},
        {id: 'content', name: 'Contents'},
        {id: 'composition', name: 'Compositions'},
        {id: 'node', name: 'Nodes'}
      ]
    }
  },
  computed: {
    widthComputed () {
      if (this.$q.screen.xs) return '100%'
      else {
        if (this.ctx === 'workspace') return this.width + 'px'
        else return '100%'
      }
    },
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
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
