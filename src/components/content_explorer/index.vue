<style lang="sass">
.menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf")
  kalpa-menu-right
    menu-right(:style=`{borderRadius: '10px', overflow: 'hidden'}`)
  kalpa-menu-footer
    template(v-slot:menuRight)
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
          //- header
          div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
            q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$router.back()")
            .col.full-height
              .row.fit.items-center.content-center.q-px-sm
                span(:style=`{minHeight: '42px', borderRadius: '10px'}`).text-bold.text-white.q-pa-sm {{ content.name }}
            q-btn(round flat color="grey-2" icon="more_vert")
          //- body
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
import extraUsers from './extra_users'
import extraWs from './extra_ws'

export default {
  name: 'contentExplorer',
  components: {extraInfo, extraNodes, extraUsers, extraWs, menuRight},
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
          this.$router.replace({params: {page: 'nodes'}})
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
