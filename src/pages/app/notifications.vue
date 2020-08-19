<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('pageApp_notifications_title', 'Уведомления')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(n,ni) in 100" :key="ni"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-center.content-center.q-px-md.q-py-md.b-50.q-mb-xs
        span.text-white Notification {{ ni }}
</template>

<script>
export default {
  name: 'pageApp_notifications',
}
</script>
