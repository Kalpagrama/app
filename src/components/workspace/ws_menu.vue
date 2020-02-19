<template lang="pug">
div(
  :style=`{
    position: 'relative',
    maxWidth: ctx === 'workspace' ? width+'px' : '100%',
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
        q-btn(round :flat="page !== 'spheres'" color="green" icon="style" @click="$emit('page', 'spheres')")
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round :flat="page !== 'settings'" color="green" icon="settings" @click="$emit('page', 'settings')")
    kalpa-buttons(:value="pagesFiltered" :id="page" idKey="id" @id="$emit('page', $event)")
    .col.full-width
      component(:is="`ws-`+page" @item="itemClick" @add="$emit('add')" :ctx="ctx")
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
      pagesRaw: [
        {id: 'notes', name: 'Notes'},
        {id: 'contents', name: 'Contents'},
        {id: 'compositions', name: 'Compositions'},
        {id: 'nodes', name: 'Nodes'}
      ]
    }
  },
  computed: {
    // page () {
    //   return this.$route.params.page
    // },
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
    itemClick (item) {
      this.$log('itemClick', item)
      this.$emit('item', JSON.parse(JSON.stringify(item)))
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
