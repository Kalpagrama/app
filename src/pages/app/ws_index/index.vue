<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.q-pt-sm.b-30
      .row.full-width.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="school" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
          q-btn(round flat color="white" icon="more_vert")
  q-page-container
    component(:is="$route.params.viewId" :id="feedId" :paddingTop="40")
      template(v-slot:top)
        .row.full-width.justify-center
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-center.content-center.justify-center.q-px-sm
            q-tabs(
              :value="$route.params.viewId" @input="viewIdChanged"
              no-caps active-color="green" align="left"
              stretch :breakpoint="100" inline-label dense
              :switch-indicator="false").full-width.text-grey-8
              q-tab(
                v-for="v in views" :key="v.id"
                inline-label
                :name="v.id" :label="v.name").q-px-sm
      //- template(v-slot:tint=`{item}`)
        div(
          @click="itemClick(item)"
          :style=`{
            position: 'absolute', zIndex: 100,
            opacity: 0.5,
          }`
          ).row.fit.bg-red
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  components: {
    feed: () => import('pages/app/ws_feed/page.vue'),
    feeds: () => import('pages/app/ws_feeds/page.vue'),
    nodes: () => import('pages/app/ws_nodes/page.vue'),
    trash: () => import('pages/app/ws_trash/index.vue')
  },
  data () {
    return {
      searchString: '',
      viewId: 'feed',
      feedId: 'all',
    }
  },
  computed: {
    views () {
      return [
        {id: 'feed', name: 'по Типу', icon: 'title'},
        {id: 'feeds', name: 'по Коллекции', icon: 'view_week'},
        {id: 'nodes', name: 'мои Ядра', icon: 'filter_tilt_shift'},
        {id: 'trash', name: 'Корзина', icon: 'delete_outline'}
      ]
    },
  },
  methods: {
    viewIdChanged (viewId) {
      this.$log('viewIdChanged', viewId)
      this.$router.push({params: {viewId: viewId}})
      // this.viewId = viewId
    },
    itemClick (item) {
      this.$log('itemClick', item)
    }
  }
}
</script>
