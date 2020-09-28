<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="notifications_none" color="white" size="30px").q-mr-sm
          .col
            span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_notifications_title', 'Уведомления')}}
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
