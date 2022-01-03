<template lang="pug">
div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`)
  .row.no-wrap.full-width
    .col-5
      img(
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '15px',
        }`
        ).row.full-width
    // название и автор
    .column.justify-center.no-wrap.q-pa-sm
      .row
        .q-pa-sm.text-white {{author}}
      .row
        .q-pa-sm.text-h6.text-white {{ item.name }}
      .row.item-center.q-pa-sm
        .q-pa-sm.text-white {{ item.countStat.countViews }}
          q-icon(name="visibility" color="white" size="20px").q-mx-xs
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Views')}}
        .q-pa-sm.text-white {{ item.countStat.countSubscribers }}
          q-icon(name="bookmark_outline" color="white" size="20px").q-mx-xs
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Bookmarks')}}
        .q-pa-sm.text-white {{ item.countStat.countNodes }}
          q-icon(name="adjust" color="white" size="20px").q-mx-xs
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Nodes')}}
        .q-pa-sm.text-white {{ item.countStat.countJoints }}
          q-icon(name="fas fa-link" color="white" size="20px").q-mx-xs
            q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Joints')}}
      .row
        q-btn(
          no-caps
          color="green"
          label="Читать"
          @click="$router.push('/content/' + item.oid)"
          ).col.full-width.q-mx-xs
        kalpa-save(:item="item" :isActive="true" :showHeader="false" inactiveColor="grey-9").q-mx-xs
  .row.full-width.q-pt-md
    //- tabs sticky
    div(
      :style=`{
                position: 'sticky', top: '0px', zIndex: 1000,
              }`).row.full-width.q-px-md.b-30
      q-tabs(
        v-model="pageId"
        switch-indicator no-caps dense
        active-color="green"
      ).full-width.text-grey-8
        q-tab(
          v-for="(p,pi) in pages" :key="p.id"
          :name="p.id" :label="p.name")
    //- tab panels
    q-tab-panels(
      v-model="pageId"
      :swipeable="$q.platform.is.mobile"
      :animated="$q.platform.is.mobile"
      :style=`{}`).full-width.b-30
      q-tab-panel(
        v-for="(p,pi) in pages" :key="p.id" :name="p.id"
        :style=`{
                  background: 'none',
                  minHeight: '70vh',
                }`
      ).row.full-width.items-start.content-start.justify-center.q-pa-sm
        //q-list(bordered).row.full-width
          //q-expansion-item(group="somegroup" icon="chat" :label="$t('Comments')" dark).col-12
          //  // template(v-slot:header)
          //    // todo самый лучший коммент
          //  row.full-width
          //    page-comments(:item="block")
          //q-separator
          //q-expansion-item(group="somegroup" icon="grid_view" :label="$t('Similar')" dark default-opened=false).col-12
          //  page-similar(:item="block")
          //q-separator
        page-comments(v-if="pageId === 'comments'" :item="item")
        //page-nodes(v-if="pageId === 'nodes'" :sphere="item" :height="700")
        item-description(v-if="pageId === 'description'" :item="item" :height="700")
        //page-joints(v-if="pageId === 'joints'" :sphere="item" :height="700")
        page-similar(v-if="pageId === 'similar'" :item="item" :types="['VIDEO', 'BOOKS', 'IMAGE']")
</template>

<script>
import pageComments from 'src/components/kalpa_item/item_extended/page_comments'
import itemDescription from 'src/components/kalpa_item/item_card/viewer/item_description.vue'
// import pageNodes from 'src/pages/app/sphere/page_nodes/index.vue'
// import pageJoints from 'src/pages/app/sphere/page_joints/index.vue'
import pageSimilar from 'src/components/kalpa_item/item_extended/page_similar'
import {ContentApi} from 'src/api/content';

export default {
  name: 'typeBook',
  props: ['item', 'isActive'],
  components: {
    pageComments,
    itemDescription,
    // pageNodes,
    // pageJoints,
    pageSimilar
  },
  data () {
    return {
      pageId: 'comments',
      pages: [
        {id: 'description', name: this.$t('Description')},
        {id: 'comments', name: this.$t('Comments')},
        {id: 'nodes', name: this.$t('Nodes')},
        {id: 'joints', name: this.$t('Joints')},
        {id: 'similar', name: this.$t('Similar')}]
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.item) },
    author() {
      return this.item.providerInfo.authors.map(a => a.value).join(', ')
    }
  },
  mounted() {
    this.$log('item!!!!!=', JSON.parse(JSON.stringify(this.item)))
  }
}
</script>
