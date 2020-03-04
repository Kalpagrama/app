<template lang="pug">
div(
  :style=`{
    position: 'relative',
    maxWidth: widthComputed,
  }`
  ).row.fit
  //- toggle opened
  q-btn(
    v-if="ctx === 'workspace' && $q.screen.gt.xs"
    round push color="green" @click="opened = !opened"
    :icon="width === 0 ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
    :style=`{position: 'absolute', zIndex: 2000, right: width === 0 ? '-60px' : '-22px', top: '50%'}`).gt-sm
  div(
    :style=`{position: 'relative', overflow: 'hidden'}`
    ).column.fit
    //- header
    div(
      v-if="ctx === 'workspace'"
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="green" icon="school")
      .col.full-height
        .row.fit.items-center
          span.text-bold.text-green Workspace {{ $store.state.workspace.revision }}
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round :flat="page !== 'sphere'" color="green" icon="style" @click="$emit('page', 'sphere')")
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round :flat="page !== 'setting'" color="green" icon="settings" @click="$emit('page', 'setting')")
    kalpa-buttons(:value="pagesFiltered" :id="page" idKey="id" @id="$emit('page', $event)")
    .col.full-width
      component(:is="`ws-`+page+`-list`" @item="$emit('item', $event)" @add="$emit('add')" :ctx="ctx")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
import wsCompositionList from './ws_composition_list'
import wsNodeList from './ws_node_list'
import wsSphereList from './ws_sphere_list'
import wsSettingList from './ws_setting_list'

export default {
  name: 'wsMenu',
  components: {wsNoteList, wsContentList, wsCompositionList, wsNodeList, wsSphereList, wsSettingList},
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
      width: 400,
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
