<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)',}`).b-30
    .row.full-width.q-pt-sm.b-30
      .row.full-width.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="school" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
          //- q-btn(round flat color="white" icon="more_vert")
  q-page-container
    //- component(:is="viewId" :id="feedId" :paddingTop="40" :useViews="feedId !== 'all'")
      //- template(v-slot:top)
        .row.full-width.justify-center
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-center.content-center.justify-center.q-px-sm
            q-tabs(
              :value="viewId" @input="$router.push({params: {viewId: $event}})"
              no-caps active-color="green" align="left"
              stretch :breakpoint="100" inline-label dense
              :switch-indicator="false").full-width.text-grey-8
              q-tab(
                v-for="v in views" :key="v.id"
                inline-label
                :name="v.id" :label="v.name").q-px-sm
      //- template(
        v-if="viewId === 'feeds'"
        v-slot:tint=`{item}`)
        div(
          @click="itemClick(item)"
          :style=`{
            position: 'absolute', zIndex: 100,
            //- opacity: 0.5,
          }`
          ).row.fit
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  components: {
    collection: () => import('pages/app/ws_collection/view_items.vue'),
    collections: () => import('pages/app/ws_collections/view_items.vue'),
    nodes: () => import('pages/app/ws_nodes/view_items.vue'),
    joints: () => import('pages/app/ws_joints/view_items.vue'),
    trash: () => import('pages/app/ws_trash/view_items.vue')
  },
  data () {
    return {
      feedId: 'bookmarks',
    }
  },
  computed: {
    viewId () {
      return this.$route.params.viewId
    },
    views () {
      return [
        {id: 'content', name: 'Контент'},
        {id: 'bookmarks', name: 'Закладки'}
        // {id: 'collection', name: 'Все', icon: 'title'},
        // {id: 'collections', name: 'Коллекции', icon: 'view_week'},
        // {id: 'nodes', name: 'Ядра', icon: 'filter_tilt_shift'},
        // {id: 'joints', name: 'Связи', icon: 'link'},
        // {id: 'trash', name: 'Корзина', icon: 'delete_outline'}
      ]
    },
  },
  methods: {
    itemClick (item) {
      this.$log('itemClick', item)
      if (this.viewId === 'feeds') {
        // go to feed
        this.$router.push('/workspace/feed/' + item.id)
      }
      else {
      }
    }
  },
  watch: {
    '$route.params.viewId': {
      immediate: true,
      handler (to, from) {
        // if (!to) this.$router.replace({params: {viewId: 'nodes'}})
      }
    }
  }
}
</script>
