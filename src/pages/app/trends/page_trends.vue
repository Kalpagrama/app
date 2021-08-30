<template lang="pug">
  kalpa-layout(
    :height="_height")
    template(v-slot:header)
      div(
        v-if="useNavHeader"
      ).row.full-width.justify-center.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          div(
            :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
            .col.full-height
              .row.fit.items-center.content-center.justify-center
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Trends')}}
            q-btn(round flat color="white" icon="more_vert")
    template(v-slot:body)
      .row.full-width.items-start.content-start
        q-tab-panels(
          v-model="pageInfo.pageId"
          :swipeable="$q.platform.is.mobile"
          :animated="$q.platform.is.mobile"
          :style=`{}`).full-width.b-30
          q-tab-panel(
            v-for="(p,pi) in pageInfo.pages" :key="p.id" :name="p.id"
            :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center
            list-feed(
              :scrollAreaHeight="_height"
              :query="query"
              nextSize=50
              :itemMiddlePersist="false"
              screenSize=100
              :itemStyles=`{ paddingBottom: '30px',}`
              :style=`{ maxWidth: $store.state.ui.pageWidth+'px'}`
              @showHeader="$emit('showHeader', $event)")
              template(v-slot:header)
                // external header
                slot(name="header")
              template(v-slot:prepend)
                slot(name="prepend")
              template(v-slot:append)
                slot(name="append")
              template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                item-feed(
                  :item="item.populatedObject"
                  :isActive="isActive"
                  :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import bookmarkListItem from 'src/components/bookmark/bookmark_list_item.vue'
import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'pageSearch',
  props: {
    height: { type: Number },
    pageInfo: { type: Object },
    useNavHeader: { type: Boolean, default: true },
    mode: { type: String },
    pagesFilter: { type: Function }
  },
  components: {
    bookmarkListItem,
    bookmarkEditor
  },
  data () {
    return {
      pageId: 'all',
      bookmarkSelected: null,
      bookmarkEditorShow: false
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    },
    query () {
      assert(this.pageInfo.pageId !== 'search')
      this.$log('query::this.pageInfo.pageId', this.pageInfo.pageId)
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
          oidSphere: this.pageInfo.pageId,
          sortStrategy: 'AGE' // 'ACTIVITY', // AGE
        },
        populateObjects: true
      }
    }
  }
}
</script>
