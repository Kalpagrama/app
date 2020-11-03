<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container).b-30
  q-header(reveal)
    div(:style=`{borderRadius: '10px 10px 0 0',}`).row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
      div(
        :style=`{
          height: '60px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.q-px-sm
        span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-ml-sm Добавить элемент
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    component(:is="viewId" :id="feedId" :paddingTop="40")
      template(v-slot:top)
        .row.full-width.items-center.content-center.justify-center.q-px-sm
          q-tabs(
            :value="viewId" @input="viewIdChanged"
            no-caps active-color="green" align="left"
            stretch :breakpoint="100" inline-label dense
            :switch-indicator="false").full-width.text-grey-8
            q-tab(
              v-for="v in views" :key="v.id"
              inline-label
              :name="v.id" :label="v.name").q-px-sm
      template(v-slot:tint=`{item}`)
        div(
          @click="itemClick(item)"
          :style=`{
            position: 'absolute', zIndex: 100,
            opacity: 0.5,
          }`
          ).row.fit.bg-red
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeEditor_itemFinder',
  props: ['node'],
  components: {
    wsFeedPage: () => import('pages/app/ws_feed/page.vue'),
    wsFeedsPage: () => import('pages/app/ws_feeds/page.vue'),
    wsNodesPage: () => import('pages/app/ws_nodes/page.vue')
  },
  data () {
    return {
      searchString: '',
      viewId: 'ws-nodes-page',
      feedId: 'all',
    }
  },
  computed: {
    height () {
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.height
      else return this.$q.screen.height * 0.8
    },
    maxWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageMaxWidth) return this.$q.screen.width / 2
      else return this.$store.state.ui.pageMaxWidth / 4
    },
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_FEED,
        }
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    views () {
      return [
        {id: 'ws-feed-page', name: 'по Типу', icon: 'title'},
        {id: 'ws-feeds-page', name: 'по Коллекции', icon: 'view_week'},
        {id: 'ws-nodes-page', name: 'мои Ядра', icon: 'filter_tilt_shift'},
      ]
    },
  },
  methods: {
    viewIdChanged (viewId) {
      if (viewId === 'ws-feed-page') {
        this.feedId = 'all'
      }
      else if (viewId === 'ws-feeds-page') {
        this.feedId = null
      }
      else if (viewId === 'ws-nodes-page') {
        this.feedId = null
      }
      this.viewId = viewId
    },
    itemClick (item) {
      if (this.viewId === 'ws-feeds-page') {
        this.feedId = item.id
        this.viewId = 'ws-feed-page'
      }
      else {
        this.$emit('item', item)
      }
    }
  }
}
</script>
