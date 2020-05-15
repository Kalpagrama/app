<style lang="sass">
.q-menu
  z-index: 50000 !important
</style>

<template lang="pug">
q-footer(v-if="$q.screen.width < 1300" reveal :style=`{zIndex: 30000}`)
  .row.full-width.justify-center
    div(:style=`{height: '60px', zIndex: 30000, maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0'}`
      ).row.full-width.items-center.content-center.q-px-sm.b-100
      //- left menu
      q-btn(round flat color="white" icon="menu")
        q-menu(anchor="top left" self="bottom left" :offset="[0, 20]" max-height="100vh" :style=`{zIndex: 40000}`)
          div(:style=`{width: $q.screen.width-19+'px', zIndex: 40000, borderRadius: '10px', overflow: 'hidden'}`).row.b-40
            kalpa-menu
      .col
        .row.fit.items-center.content-center.justify-center
          //- q-btn(
          //-   v-if="options.showAddBtn" @click="$emit('addBtnClick')"
          //-   round push color="green" icon="add"
          //-   :style=`{borderRadius: '50%'}`)
      //- right
      q-btn(
        v-if="options.showMenuPage"
        round flat color="white" icon="menu_open")
        q-menu(anchor="top left" self="bottom left" :offset="[0, 20]")
          div(:style=`{width: $q.screen.width-19+'px', borderRadius: '10px', overflow: 'hidden'}`).row.b-40
            slot(name="menuRight")
</template>

<script>
export default {
  name: 'kalpaMenuFooter',
  props: {
    options: {
      default () {
        return {}
      }
    }
  }
}
</script>
