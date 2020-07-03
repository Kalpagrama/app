<template lang="pug">
kalpa-layout(
  :title="$t('settings', 'Настройки')"
  :style=`{height: $q.screen.height+'px'}`)
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px',}`).row.full-width.items-center.content-center.q-pa-sm.b-60
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col
        .row.fit.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '16px'}`).text-white.text-bold {{$t('settings', 'Настройки')}}
  //- template(v-slot:drawerRight)
  //-   menu-right(:style=`{maxWidth: '260px'}`)
  template(v-slot:page)
    div(:style=`{maxWidth: '800px',paddingTop: '70px'}`).row.fit.q-pb-sm
      div(:style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).row.fit.b-50
        //- router-view
        kalpa-profile
</template>

<script>
import menuRight from './menu_right'

export default {
  name: 'pageAppSettings',
  components: {menuRight},
}
</script>
