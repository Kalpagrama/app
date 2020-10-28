<style lang="sass" scoped>
.feed-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff" container
  :style=`{
    borderRadius: '10px',
  }`)
  q-header(reveal).b-30
    //- header
    div(
      :style=`{
        height: '60px',
        borderRadius: '10px 10px 0 0',
      }`
      ).row.full-width.items-center.b-30
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите коллекцию
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')").q-mr-sm
    //- search or create...
    .row.full-width.justify-start.q-px-sm.q-py-sm.b-30
      div(:style=`{maxWidth: '700px',}`).row.full-width
        .col
          div(
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            q-input(
              v-model="searchString"
              borderless dense dark color="green"
              placeholder="Поиск"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
              template(v-slot:append)
                q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = ''").q-mr-sm
        q-btn(
          round flat color="grey-4" icon="add")
        //- q-btn(
        //-   round flat color="grey-4" icon="tune")
  q-page-container
    q-page
      kalpa-loader(
        :immediate="true"
        :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
        .row.full-width.items-start.content-start.q-pa-sm.b-30
          div(
            v-for="(feed, ii) in items" :key="feed.id"
            :style=`{
              position: 'relative',
            }`
            ).row.full-width.q-mb-xs
            //- tint
            div(
              :style=`{
                position: 'absolute', zIndex: 100,
              }`
              ).row.fit
              div(
                v-if="bookmark.feeds.includes(feed.id)"
                @click="feedDelete(feed)"
                :style=`{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px',
                }`
                ).row.fit.items-center.content-center.justify-end.q-pa-md.cursor-pointer
                q-checkbox(
                  color="green"
                  :value="true"
                  :style=`{
                    pointerEvents: 'none',
                  }`)
              div(
                v-else
                @click="feedAdd(feed)"
                :style=`{
                  borderRadius: '10px',
                }`
                ).row.fit.cursor-pointer
            //- default
            div(
              :style=`{
                height: '50px',
                borderRadius: '10px', overflow: 'hidden',
                background: 'rgb(35,35,35)'
              }`
              ).row.full-width.feed-item.cursor-pointer
              //- TODO: impl add feed_item to get first item...
              //- div(
                :style=`{
                  width: '50px',
                  height: '50px',
                }`
                ).row
                img(
                  v-if="feed.items[0]"
                  draggable="false"
                  :src="feed.items[0].thumbUrl"
                  :style=`{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px', overflow: 'hidden',
                  }`)
                div(
                  v-else
                  :style=`{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.b-50
              .col.full-height
                .row.fit.items-center.content-center.q-px-sm
                  span.text-white.text-bold {{ feed.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaBookmark_feedsSelector',
  props: ['oid', 'bookmark'],
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
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
    }
  },
  methods: {
    feedAdd (feed) {
      this.$log('feedAdd')
      feed.items.push(this.bookmark.id)
      this.bookmark.feeds.push(feed.id)
    },
    feedDelete (feed) {
      this.$log('feedDelete', feed)
      feed.items = feed.items.filter(id => id !== this.bookmark.id)
      this.bookmark.feeds = this.bookmark.feeds.filter(id => id !== feed.id)
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
