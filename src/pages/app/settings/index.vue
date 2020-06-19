<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- kalpa-menu-right
  //-   menu-right
  //- kalpa-menu-footer
  //-   template(v-slot:menuRight)
  //-     menu-right
  q-page-conainter
    q-page
      div(:style=`{height: '60px'}`).row.full-width.justify-center
        div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.q-px-sm
          span(:style=`{fontSize: '30px'}`).text-white Settings
      .row.full-width.justify-center.q-pt-sm.q-px-xs
        div(
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
            minHeight: $q.screen.width > $store.state.ui.maxWidthPage ? $store.state.ui.maxWidthPage+'px' : $q.screen.width+'px'
          }`).row.full-width.bg-grey-9.q-pa-md
          docs(v-if="$route.params.page === 'docs'")
</template>

<script>
import menuRight from './menu_right'
import docs from './docs'

export default {
  name: 'pageAppSettings',
  components: {menuRight, docs},
  data () {
    return {
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
          this.$router.replace({params: {page: 'docs'}})
        }
      }
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
