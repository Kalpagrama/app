<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="view_week" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white Уведомления
          .col
          //- q-btn(round flat color="green" icon="add" to="/settings/feeds")
          //- q-btn(round flat color="white" icon="settings" to="/settings/feeds")
  q-page-container
    q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          router-view
</template>

<script>
export default {
  name: 'pageApp_notifications_viewHome',
  data () {
    return {
    }
  }
}
</script>
