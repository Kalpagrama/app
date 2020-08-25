<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('pageApp_settings_title', 'Настройки')}}
  .col.full-width
    kalpa-profile
</template>

<script>
import menuRight from './menu_right'
// TODO: add page router, and reuse kalpa-profile or not?

export default {
  name: 'pageAppSettings',
  components: {menuRight},
}
</script>
