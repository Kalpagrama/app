<style lang="sass">
.feed-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-dialog(
    v-model="feedCreatorOpened"
    transition-show="none"
    transition-hide="none"
    :maximized="$q.screen.width < 800")
    collection-creator(
      @close="feedCreatorOpened = false")
  q-header(reveal)
    .row.full-width.q-pt-sm.q-px-sm.b-30
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px', height: '60px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-center.b-40.q-px-sm
          q-icon(name="view_week" size="30px" color="white").q-mr-md.q-ml-sm
          .col
            span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Подборки
          q-btn(round flat color="white" icon="more_vert")
  q-page-container
    view_items()
      template(v-slot:tint=`{item}`)
        div(
          @click="feedClick(item)"
          :style=`{position: 'absolute', zIndex: 100,}`).row.fit.br
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsCollections',
  components: {
    collectionCreator: () => import('./collection_creator.vue'),
  },
  data () {
    return {
      searchString: '',
      feedCreatorOpened: false,
    }
  },
  methods: {
    async feedClick (feed) {
      this.$log('feedClick', feed)
      this.$router.push(`/workspace/collection/${feed.id}`).catch(e => e)
      // await this.$rxdb.remove(feed.id)
    },
    feedCreate () {
      this.$log('feedCreate')
    },
    feedDelete () {
      this.$log('feedDelete')
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
    }
  }
}
</script>
