<template lang="pug">
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
    //- video
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
      img(
        v-if="!playerReady"
        :src="item.thumbUrl"
        :style=`{
        borderRadius: '10px',
      }`
      ).full-width
      content-player(
        v-if="item.type === 'VIDEO'"
        @player="playerReady"
        :contentKalpa="item"
        :isActive="true"
        :isVisible="true"
        :isMini="false"
        :style=`{
      position: 'absolute', zIndex: 100, top: '0px', borderRadius: '10px',
    }`
      ).fit
      // fullpage (description / coments / nodes)
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="pageId"
        :style=`{
                position: 'relative',
                borderRadius: '20px 20px 0 0',
                height: bottomHeight + 'px',
              }`).row.full-width.b-30
        component(:is="'page-' + pageId"
          :item="item"
          :height="bottomHeight"
          @close="pageId=null")
    .row.full-width.items-center.content-center.wrap.q-py-sm.q-pl-sm
      //q-icon(name="select_all" color="white" size="36px").q-mr-sm
      .row.col
        span(:style=`{lineHeight: 1.2, fontSize: '15px'}`).text-white.text-bold.full-width {{ item.name }}
        small(:style=`{lineHeight: 1.2}`).text-grey.full-width {{$t('Ознакомительный фрагмент')}}
      q-btn(v-if="true || item.description" round flat dense icon="expand_more" color="grey-5" @click="pageId='description'" :style=`{zIndex: '100'}`)
    .row.item-center.q-pa-sm
      .q-pa-sm.text-white {{ item.countStat.countViews }}
          span(v-if="$q.platform.is.desktop" dense dark) {{$t('Views')}}
      //.q-pa-sm.text-white {{ item.countStat.countSubscribers }}
      //  q-icon(name="bookmark_outline" color="white" size="20px").q-mx-xs
      //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Bookmarks')}}
      //.q-pa-sm.text-white {{ item.countStat.countNodes }}
      //  q-icon(name="adjust" color="white" size="20px").q-mx-xs
      //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Nodes')}}
      //.q-pa-sm.text-white {{ item.countStat.countJoints }}
      //  q-icon(name="fas fa-link" color="white" size="20px").q-mx-xs
      //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Joints')}}
    .col
    .row
      q-btn(
        no-caps
        color="green"
        :label="$t('Получить доступ к полной версии')"
        @click="$router.push('/content/' + item.oid)"
      ).col.full-width.q-mx-xs
      kalpa-save(:item="item" :isActive="true" :showHeader="false" inactiveColor="grey-9").q-mx-xs
    .row.full-width.content-end.q-pt-md
      div(@click="pageId='comments'").cursor-pointer.row.full-width.items-center
        // div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
        span.text-grey-5.q-px-sm {{$t('Comments')}}
        span.text-grey-8 {{item.countStat.countComments}}
        .col
        q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="grey-5" :style=`{zIndex: '100'}`  @click="pageId='comments'")
        // div(v-if="item.commentStat.topComment").row.full-width.items-center
          q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mx-xs.q-mb-xs
            img(:src="item.commentStat.topComment.author.thumbUrl" :to="'/user/'+item.commentStat.topComment.author.oid")
            div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
          .col.content-center.q-px-xs
            small.text-grey.text-weight-thin.text-italic.q-pr-md {{item.commentStat.topComment.text.substring(0, 77)}}{{item.commentStat.topComment.text.length>77?'...':''}}
    //.row.full-width.q-pt-md
      ////- tabs sticky
      //div(
      //  :style=`{
      //              position: 'sticky', top: '0px', zIndex: 1000,
      //            }`).row.full-width.q-px-md.b-30
      //  q-tabs(
      //    v-model="pageId"
      //    switch-indicator no-caps dense
      //    active-color="green"
      //  ).full-width.text-grey-8
      //    q-tab(
      //      v-for="(p,pi) in pages" :key="p.id"
      //      :name="p.id" :label="p.name")
      ////- tab panels
      //q-tab-panels(
      //  v-model="pageId"
      //  :swipeable="$q.platform.is.mobile"
      //  :animated="$q.platform.is.mobile"
      //  :style=`{}`).full-width.b-30
      //  q-tab-panel(
      //    v-for="(p,pi) in pages" :key="p.id" :name="p.id"
      //    :style=`{
      //                background: 'none',
      //                minHeight: '70vh',
      //              }`
      //  ).row.full-width.items-start.content-start.justify-center.q-pa-sm
      //    //q-list(bordered).row.full-width
      //      //q-expansion-item(group="somegroup" icon="chat" :label="$t('Comments')" dark).col-12
      //      //  // template(v-slot:header)
      //      //    // todo самый лучший коммент
      //      //  row.full-width
      //      //    page-comments(:node="block")
      //      //q-separator
      //      //q-expansion-item(group="somegroup" icon="grid_view" :label="$t('Similar')" dark default-opened=false).col-12
      //      //  page-similar(:node="block")
      //      //q-separator
      //    page-comments(v-if="pageId === 'comments'" :node="item")
      //    page-nodes(v-if="pageId === 'nodes'" :sphere="item" :height="700")
      //    item-description(v-if="pageId === 'description'" :item="item" :height="700")
      //    //page-joints(v-if="pageId === 'joints'" :sphere="item" :height="700")
      //    //page-similar(v-if="pageId === 'similar'" :node="item" :types="['VIDEO', 'BOOKS', 'IMAGE']")
</template>

<script>
import {ContentApi} from 'src/api/content'
import contentPlayer from 'src/components/content_player/index.vue'
import pageComments from '../../../pages/app/node/page_comments';
import pageDescription from 'src/components/kalpa_item/item_card/video/page_description.vue'
import pageSimilar from '../../../pages/app/node/page_similar';

export default {
  name: 'typeVideo',
  props: ['item', 'isActive'],
  components: {
    contentPlayer,
    pageComments,
    pageDescription,
    pageSimilar
  },
  data() {
    return {
      playerReady: false,
      pageId: null, // description|comments|nodes
      bottomHeight: null
      // pages: [
      //   {id: 'description', name: this.$t('Description')},
      //   {id: 'comments', name: this.$t('Comments')},
      //   {id: 'nodes', name: this.$t('Nodes')},
      //   {id: 'joints', name: this.$t('Joints')},
      //   {id: 'similar', name: this.$t('Similar')}]
    }
  },
  computed: {
    url() {
      return ContentApi.urlSelect(this.item)
    },
  }
}
</script>
