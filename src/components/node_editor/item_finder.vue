<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container
  :style=`{
    width: '800px',
    height: height+'px',
    //- borderRadius: '10px 10px 0 0',
    //- overflow: 'hidden',
  }`)
  q-header(reveal)
    div(:style=`{borderRadius: '10px 10px 0 0',}`).row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
      //- header
      div(
        :style=`{
          height: '60px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.b-40.q-px-sm
        span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-ml-sm Добавить элемент
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- types
      div(
        v-if="!feedId"
        ).row.full-width.justify-center.q-px-sm
        q-tabs(
          :value="viewId" @input="viewId = $event, feedId = null"
          no-caps active-color="green" align="left"
          stretch :breakpoint="100" inline-label dense
          :switch-indicator="true").full-width.text-grey-8
          q-tab(
            v-for="v in views" :key="v.id"
            inline-label
            :name="v.id" :label="v.name" :icon="v.icon").q-px-xs
      //- search
      div(
        v-if="!feedId"
        ).row.full-width.justify-start
        div(:style=`{maxWith: '700px'}`).col
          ws-search(
            @searchString="searchString = $event"
            :style=`{}`
          )
  q-page-container
    //- feeds page
    q-page(v-if="viewId === 'feeds'").row.full-width.justify-center
      kalpa-loader(
        v-if="viewId === 'feeds' && !feedId"
        :immediate="true"
        :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start.justify-start.q-pt-sm.b-30
          feed-all(
            v-if="searchString.length === 0"
            @click.native="feedClick({id: 'all'})"
            :maxWidth="maxWidth")
          feed-item(
            v-for="(feed,ii) in items" :key="feed.id"
            @click.native="feedClick(feed)"
            :maxWidth="maxWidth"
            :feed="feed")
    //- feed page
    ws-feed(
      v-if="viewId === 'feed' && feedId"
      :id="feedId").b-30
      template(v-slot:search-prepend)
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="viewId = 'feeds', feedId = null")
      template(v-slot:tint=`{item}`)
        div(
          @click="itemClick(item)"
          :style=`{position: 'absolute', zIndex: 200,}`).row.fit
          //- small.text-white {{item}}
    //- nodes
    ws-nodes(
      v-if="viewId === 'nodes'"
      mode="pick"
      :showHeader="false"
      :searchStringInput="searchString").b-30
    //- joints
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeEditor_itemFinder',
  components: {
    feedAll: () => import('pages/app/ws_feeds/feed_all.vue'),
    feedCreator: () => import('pages/app/ws_feeds/feed_creator.vue'),
    feedItem: () => import('pages/app/ws_feeds/feed_item.vue'),
    wsFeed: () => import('pages/app/ws_feed/feed.vue'),
    wsNodes: () => import('pages/app/ws_nodes/index.vue')
  },
  data () {
    return {
      searchString: '',
      viewId: 'feeds',
      feedId: null,
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
        {id: 'feeds', name: 'Подборки', icon: 'view_week'},
        {id: 'nodes', name: 'Ядра', icon: 'filter_tilt_shift'},
        // {id: 'joints', name: 'Связи', icon: 'link'}
      ]
    },
  },
  methods: {
    feedClick (feed) {
      this.$log('feedClick', feed)
      this.viewId = 'feed'
      this.feedId = feed.id
    },
    async itemClick (item) {
      this.$log('itemClick', item)
      if (item.wsItemType === 'WS_BOOKMARK') {
        // extract everything from node
        if (item.type === 'NODE') {
          // take everything from node
        }
        // use video content
        if (item.type === 'VIDEO') {
          // use as sphere...
          // open content node extractor...
        }
        // use image content, extract nodes from the content
        if (item.type === 'IMAGE') {
          // create compositionInput
        }
        // use user, sphere, word, sentence...
        if (['USER', 'SPHERE'].includes(item.type)) {
          this.$q.notify({type: 'negative', position: 'top', message: 'You cant add sphere/user for now :('})
          // // find sphere with item.name in workspace...
          // let [sphere] = await this.$rxdb.find({
          //   selector: {
          //     rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: item.name,
          //   }
          // })
          // // do nothing?
          // if (sphere) {
          // }
          // // create sphere in workspace...
          // else {
          //   let sphereInput = {
          //     wsItemType: 'WS_SPHERE',
          //     spheres: [],
          //     name: item.name,
          //   }
          //   sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          // }
          // // emit sphere event to nodeEditor
          // this.$emit('sphere', {id: sphere.id, name: sphere.name, oid: item.oid})
        }
      }
    }
  }
}
</script>
