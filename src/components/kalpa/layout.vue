<style lang="sass" scoped>
.menu-item
  cursor: pointer
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width.justify-center
  //- left drawer
  div(
    v-if="$slots.drawerLeft && $q.screen.width >= 1260"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 8888, left: '0px', top: '8px', width: ($q.screen.width-800)/2+'px',
      pointerEvents: pointerEvents,
      height: 'calc(100% - 16px)',
    }`).row.items-start.content-start.justify-end.q-px-sm
    slot(name="drawerLeft")
  //- right drawer
  div(
    v-if="$slots.drawerRight && $q.screen.width >= 1260"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 8888, right: '0px', top: '8px', width: ($q.screen.width-800)/2+'px',
      pointerEvents: rightDrawerScroll ? 'auto' : pointerEvents,
      height: 'calc(100% - 16px)',
    }`).row.items-start.content-start.justify-start.q-px-sm
    slot(name="drawerRight")
  //- footer
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="$q.screen.width  < 1260 && !$store.state.ui.appShowMenu"
      @wheel="onWheel"
      :style=`{
        position: 'fixed', zIndex: 7777, bottom: '0px',
        pointerEvents: pointerEvents,
      }`).row.full-width.justify-center
      div(:style=`{maxWidth: 800+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden',}`).row.full-width.b-60
        //- page menu
        div(
          v-kalpa-click-outside="pageMenuClickOutside"
          :style=`{
            position: 'relative',
            height: pageMenuHeight+'px',
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
          }`
          ).column.full-width
          //- header
          div(
            v-if="title"
            :style=`{height: '100px'}`).row.full-width.items-center.content-center.q-px-md
            span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white.text-bold {{ title }}
          //- body
          .col.full-width.scroll
            div(v-if="pages").row.full-width.items-start
              div(
                v-for="(p,pi) in pages" :key="pi"
                @click="$emit('pageId', p.id), pageMenuShow = false"
                :class=`{
                    'b-70': $route.name === p.id,
                  }`
                :style=`{
                  height: '50px',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }`
                ).row.full-width.items-center.content-center.menu-item.q-px-md
                span(
                  :style=`{
                    fontSize: '16px',
                    userSelect: 'none'
                  }`
                  ).text-white {{ p.name }}
        //- footer bottom
        .row.full-width.b-60
          q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
          .col
            div(v-if="pagesHot").row.fit.items-end.content-end.justify-center
              q-tabs(
                :value="pageId" @input="$emit('pageId', $event)"
                no-caps dense
                align="center"
                active-color="green").full-height
                q-tab(v-for="(p,pi) in pagesHot" :key="p.id" :name="p.id" :label="p.name" :style=`{color: 'white'}`).full-height
          q-btn(
            @click="pageMenuShow = !pageMenuShow"
            round flat color="white"
            :icon="pageMenuShow ? 'keyboard_arrow_down' : 'keyboard_arrow_up'")
  //- header
  div(
    v-if="$slots.header"
    @wheel="onWheel"
    :style=`{
      position: 'fixed', zIndex: 7777, top: '0px',
      pointerEvents: pointerEvents,
    }`).row.full-width.justify-center
    slot(name="header")
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="pageMenuShow === true"
      @click="pageMenuShow = false"
      :style=`{position: 'absolute', zIndex: 6666, top: 0, bottom: 0, left: 0, right: 0,
      background: 'rgba(0,0,0,0.4)'}`).row.fit
  slot(name="page")
</template>

<script>
export default {
  name: 'kalpaLayout',
  props: ['title', 'pages', 'pagesHot', 'pageId', 'rightDrawerScroll'],
  data () {
    return {
      pointerEventsTimeout: null,
      pointerEvents: false,
      pageMenuShow: false,
      pageMenuHeight: 0,
      pageMenuBlock: false,
    }
  },
  watch: {
    pageMenuShow: {
      handler (to, from) {
        this.$log('pageMenuShow TO', to)
        this.pageMenuBlock = true
        this.$tween.to(this, 0.2, {
          pageMenuHeight: to ? this.$q.screen.height / 2 : 0,
          onComplete: () => {
            this.pageMenuBlock = false
          }
        })
      }
    }
  },
  methods: {
    pageMenuClickOutside (e) {
      if (!this.pageMenuShow || this.pageMenuBlock) return
      this.$log('pageMenuClickOutside', e)
      if (this.pageMenuShow) {
        this.pageMenuShow = false
      }
    },
    onWheel (e) {
      // this.$log('onWheel', e)
      if (this.pointerEventsTimeout !== undefined) clearTimeout(this.pointerEventsTimeout)
      this.pointerEvents = 'none'
      this.pointerEventsTimeout = setTimeout(() => {
        this.pointerEvents = 'auto'
      }, 100)
    },
  }
}
</script>
