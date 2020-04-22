<style lang="sass">
.menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      top: '0px',
      zIndex: 1000,
      width: $store.state.ui.maxWidthMenu+'px',
      height: $q.screen.height+'px',
      right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '68px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    menu-right
  //- footer
  q-footer
    .row.full-width.justify-center
      div(
        :style=`{height: '60px', maxWidth: $store.state.maxWidthPage+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
        ).row.full-width.items-center.bg-grey-8.q-px-sm
        q-btn(round flat color="grey-5" icon="menu")
          q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
            div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-9
              kalpa-menu
        .col
        q-btn(round flat color="grey-5" icon="more_vert")
          q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
            div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.bg-grey-8
              div(:style=`{minHeight: '60px'}`).row.full-width.items-center.content-center.q-pa-md
                span.text-white {{ content.name }}
              menu-right
              div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
                q-btn(round flat color="grey-5" icon="keyboard_arrow_left")
  //- page
  q-page-container
    q-page
      .row.full-width.justify-center
        div(
          :style=`{
            position: 'relative',
            height: $q.screen.height+'px',
            maxWidth: $store.state.ui.maxWidthPage+'px'
          }`).row.full-width.q-px-xs
          composition(
            v-if="content"
            ctx="workspace"
            :value="composition"
            :visible="true" :active="true" :mini="false"
            :styles=`{
              paddingTop: 8+'px',
              paddingBottom: paddingBottom+'px',
              paddingRight: paddingRight+'px'
            }`)
            template(v-slot:editor=`{player, meta}`)
              component(
                :is="`extra-${$route.params.page}`"
                :content="content" :player="player" :meta="meta"
                @meta="$parent.$emit('meta', $event)"
                :style=`{
                  position: 'absolute', height: paddingBottom+'px', bottom: '0px'
                }`)
</template>

<script>
import menuRight from './menu_right'
import extraInfo from './extra_info'
import extraNodes from './extra_nodes'
import extraNotes from './extra_notes'
import extraUsers from './extra_users'
import extraWs from './extra_ws'

export default {
  name: 'contentExplorer',
  components: {extraInfo, extraNodes, extraNotes, extraUsers, extraWs, menuRight},
  props: ['content'],
  data () {
    return {
      paddingBottom: 500
    }
  },
  computed: {
    composition () {
      return {
        layers: [
          {
            contentOid: this.content.oid,
            figuresAbsolute: [{t: 0}, {t: this.content.duration}],
            figuresRelative: [{t: 0}, {t: this.content.duration}],
            spheres: []
          }
        ]
      }
    }
  },
  watch: {
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
        }
        else {
          this.$router.replace({params: {page: 'info'}})
        }
      }
    }
  },
  created () {
    this.$log('created')
    document.body.style.backgroundColor = '#222'
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
