<template lang="pug">
q-page(:style=`{paddingTop: '8px',}`).row.full-width.justify-center
  div(:style=`{height: $q.screen.height-105+'px', maxWidth: '800px',}`).row.full-width.items-start.content-start
    .row.full-width.q-py-md
      .col.q-pl-sm
        div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
          q-input(
            v-model="searchString"
            filled dark dense color="grey-6"
            placeholder="Find feed"
            ).full-width
      q-btn(
        @click="feedCreateStart()"
        round flat color="green" icon="add")
    .row.full-width.items-start.contents-start.q-pt-sm
      kalpa-loader(:mangoQuery="queryFeeds" :sliceSize="1000" v-slot=`{items,next}`)
        .row.full-width.items-start.content-start.q-px-sm
          router-link(
            v-for="(f,fi) in items" :key="f.id"
            :to="`/settings/feed/${f.id}`"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              height: '100px',
            }`
            ).row.full-width.items-center.content-center.q-px-md.q-mb-sm.b-40
            span.text-white {{ f.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_settings_viewFeeds',
  data () {
    return {
      searchString: '',
      feed: null,
    }
  },
  computed: {
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'feed'
          // stage: 'feed'
        }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
    async feedCreateStart () {
      this.$log('feedCreateStart')
      let name = prompt('Feed name')
      if (name && name.length > 0) {
        this.$log('feedCreateStart name', name)
        let feedInput = {
          name: name,
          spheres: [],
          wsItemType: 'WS_BOOKMARK',
          type: 'feed',
          items: [],
          thumbUrl: '',
        }
        let feed = await this.$rxdb.set(RxCollectionEnum.WS_NODE, feedInput)
        this.$log('feedCreateStart feed', feed)
        this.$router.push(`/settings/feed/${feed.id}`).catch(e => e)
      }
    }
  }
}
</script>
