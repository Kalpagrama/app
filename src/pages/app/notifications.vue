<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('pageApp_notifications_title', 'Уведомления')}}
  q-page-container
    q-page(style="padding-top: 0px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '1000px',}`).row.full-width.items-start.content-start.q-px-sm
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
  name: 'pageApp__notifications',
  meta: {
    title: 'Notifications',
  },
  data () {
    return {
    }
  }
}
</script>
