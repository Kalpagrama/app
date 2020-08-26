<template lang="pug">
//- div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('pageApp_settings_title', 'Настройки')}}
  .col.full-width
    kalpa-profile
q-layout(view="hHh Lpr lff")
  q-page-container
    router-view
</template>

<script>
export default {
  name: 'pageApp_settings',
  components: {},
}
</script>
