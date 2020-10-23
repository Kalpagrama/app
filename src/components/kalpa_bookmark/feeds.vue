<style lang="sass" scoped>
.feed-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: '500px',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).column.full-width.b-30
  //- header
  div(
    :style=`{
      height: '60px',
    }`
    ).row.full-width.items-center
    span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите коллекцию
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')").q-mr-sm
  //- search or create...
  .row.full-width.justify-start.q-px-sm.q-py-sm
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
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
      .row.full-width.items-start.content-start.q-pa-sm
        div(
          v-for="(feed,ii) in items" :key="feed.id"
          @click="feedClick(feed)"
          flat no-caps color="white" align="left"
          :style=`{
            height: '50px',
            borderRadius: '10px', overflow: 'hidden',
            background: 'rgb(35,35,35)'
          }`
          ).row.full-width.q-mb-sm.feed-item.cursor-pointer
          div(
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
  name: 'kalpaBookmark_feeds',
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
    feedClick (feed) {
      this.$log('feedClick', feed)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
