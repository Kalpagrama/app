<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  ).b-30
  q-header(reveal).row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
    .row.full-width
      div(
        v-if="feed"
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.q-px-sm.b-30.q-mb-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col
          .row.fit.items-center.content-center
            //- span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ feed.name }}
            q-input(
              v-if="feed"
              v-model="feed.name"
              placeholder="Enter feed name"
              borderless dark
              :autofocus="feed.name.length === 0"
              :input-style=`{
                fontSize: '18px',
                fontWeight: 'bold',
              }`
              :style=`{}`).full-width
        q-btn(round flat color="white" icon="launch" @click="$router.push('/feeds/'+feed.id)")
    //- views
    .row.full-width
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        q-tabs(
          v-model="viewId"
          no-caps align="left" active-color="green" dense
          ).full-width.text-grey-7
          q-tab(
            v-for="(view, ii) in views" :key="view.id"
            :name="view.id" :label="view.name")
  q-page-container
    component(:is="`view-${viewId}`" :collection="collection")
    //- page(:id="$route.params.id")
    //- view-items(:id="$route.params.id")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsCollection',
  components: {
    viewDetails: () => import('./view_details.vue'),
    viewItems: () => import('./view_items.vue'),
    viewSubscriptions: () => import('./view_subscriptions.vue'),
    viewViews: () => import('./view_subscriptions.vue')
  },
  data () {
    return {
      viewId: 'items',
      collection: null,
      collectionNew: {
        name: '',
        spheres: [],
        items: [],
        wsItemType: 'WS_COLLECTION',
        thumbUrl: '',
      },
      itemSelected: null,
      // searchString: '',
      // typesSelected: [],
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: 'Details'},
        {id: 'items', name: 'Items'},
        {id: 'subscriptions', name: 'Subscriptions'},
        {id: 'views', name: 'Views'},
      ]
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'all') {
            this.collection = {id: 'all', name: 'Все закладки'}
          }
          else {
            this.collection = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
