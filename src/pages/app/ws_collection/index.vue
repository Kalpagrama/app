<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  ).b-30
  q-header(reveal :style=`{paddingTop: 'env(safe-area-inset-top)'}`).b-30
    .row.full-width.justify-center
      div(
        v-if="collection"
        :style=`{
          minHeight: '60px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.q-px-sm.b-30
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col
          .row.fit.items-center.content-center
            q-input(
              v-model="collection.name"
              placeholder="Введите название"
              borderless dark color="green"
              :autofocus="collection.name.length === 0"
              :input-style=`{
                fontSize: '18px',
                fontWeight: 'bold',
              }`
              :label="'Коллекция'"
              :style=`{}`).full-width
        q-btn(round flat color="white" icon="view_week" @click="$router.push('/feeds/'+collection.id)")
    //- views
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-sm
        q-tabs(
          v-model="viewId"
          no-caps align="left" active-color="green" dense
          ).full-width.text-grey-7
          q-tab(
            v-for="(view, ii) in views" :key="view.id"
            :name="view.id" :label="view.name")
  q-page-container
    component(
      v-if="collection"
      :is="`view-${viewId}`" :collection="collection")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsCollection',
  components: {
    viewDetails: () => import('./view_details.vue'),
    viewItems: () => import('./view_items.vue'),
    viewSubscriptions: () => import('./view_subscriptions.vue'),
    viewViews: () => import('./view_views.vue')
  },
  data () {
    return {
      viewId: 'items',
      collection: null,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: 'Детали'},
        {id: 'items', name: 'Элементы'},
        {id: 'subscriptions', name: 'Подписки'},
        // {id: 'views', name: 'Views'},
      ]
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let collection = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
          if (collection) this.collection = collection
          else this.$router.replace('/workspace/collections')
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
