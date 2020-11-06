<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px', borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="notifications_none" color="white" size="30px").q-mx-sm
          .col
            span(
              :style=`{fontSize: '18px', userSelect: 'none'}`
              ).text-bold.text-white {{$t('pageApp_notifications_title', 'Уведомления')}}
          q-btn(round flat color="grey-8" icon="settings")
  q-page-container
    router-view
</template>

<script>
export default {
  name: 'pageApp_notifications',
  data () {
    return {
    }
  }
}
</script>
