<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.q-pt-sm.q-px-sm
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="school" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Мастерская
          q-btn(round flat color="white" icon="more_vert")
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start.q-pt-sm
          ws-search(
            @searchString="searchString = $event"
            :style=`{
              maxWidth: '700px',
            }`
            )
  q-page-container
    q-page(v-if="searchString.length === 0").row.full-width.justify-center.q-pt-md.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageMaxWidth+'px'
        }`).row.full-width.items-start.content-start
        div(
          v-for="(page,ii) in pages" :key="page.id"
          :style=`{
          }`).col-xs-12.col-md-4.q-pa-xs
          div(
            :style=`{
              position: 'relative',
              height: 0,
              paddingBottom: $q.screen.width < 800 ? '50%' : '100%',
            }`
            ).row
            div(
              @click="$router.push('/workspace/'+page.id)"
              :style=`{
                position: 'absolute', zIndex: 10,
                borderRadius: '10px', overflow: 'hidden',
              }`).column.fit.items-center.content-center.b-40.cursor-pointer
              .col.full-width
              div(:style=`{height: '60px',}`).row.full-width.items-center.content-center.q-px-md
                q-icon(:name="page.icon" color="white" size="30px").q-mr-sm
                span(:style=`{fontSize: '18px',}`).text-white.text-bold {{page.name}}
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    pages () {
      return [
        {id: 'feeds', name: this.$t('pageWs_podborki', 'Подборки'), icon: 'view_week'},
        {id: 'nodes', name: this.$t('pageWs_nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'joints', name: this.$t('pageWs_joints', 'Связи'), icon: 'link'}
      ]
    },
  }
}
</script>
