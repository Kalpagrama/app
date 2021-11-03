<template lang="pug">
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    div(
      :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
      overflow: $q.screen.lt.md ? 'visible' : 'hidden',
    }`
    ).row.full-width
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
      // видео
      .row.full-width
        div(:style=`{overflow: $q.screen.lt.md ? 'visible' : 'hidden',  borderRadius: '10px',}`).row.full-width.relative-position
          img(
            :src="item.thumbUrl"
            :style=`{
              opacity: playerReady ? 0 : 1
            // borderRadius: '10px',
          }`
          ).full-width
          content-player(
            v-if="item.type === 'VIDEO'"
            @player="playerReady=true"
            :contentKalpa="item"
            :isActive="true"
            :isVisible="true"
            :isMini="false"
            :style=`{zIndex: 100}`
          ).fit.absolute-top
          div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 35%)', zIndex: 110}`).fit.absolute-bottom
        div(v-if="true" :style=`{position: 'absolute', zIndex: 120, bottom: '0px', left: '0px'}`).row.full-width.q-pb-xs.q-px-xs
          .row.col
            small(:style=`{lineHeight: 1.2}`).text-grey-4.q-pt-xs.q-px-xs {{$t('Ознакомительный фрагмент')}}
          .row.q-mr-sm
            q-btn(
              no-caps outline dense
              size="sm"
              color="green"
              :label="$t('Полный доступ')"
              @click="showDialog = true"
            ).full-width.q-px-sm
              q-dialog(v-model="showDialog" transition-show="flip-up" transition-hide="flip-down" :content-style=`{borderRadius: '10px', background: 'rgba(40,40,40,0.7)'}`)
                div(:style=`{ borderRadius: '10px', color: 'white', border: '2px solid rgb(76,175,79)', paddingLeft: '10px', background: 'rgba(40,40,40)'}`).row.full-width
                  q-input(v-model="promoCode", autofocus, borderless dark :placeholder="$t('Введите промокод')" @keyup.enter="enterPromoCode(true)").col.full-width
                  q-btn(v-close-popup round flat :color="promoCode ? 'green' : null", icon="done", :disable="!promoCode" @click="enterPromoCode(true)")
              //q-dialog(
              //  v-model="showDialog"
              //  position="standard"
              //  :maximized="false")
              //  kalpa-pay(
              //    v-if="item"
              //    :oid="item.oid"
              //    :type="item.type"
              //    :name="item.name"
              //    :thumbUrl="item.thumbUrl"
              //    :isActive="true"
              //    :formOnly="true"
              //    inactiveColor="grey-3"
              //    :fields=`{contentType: item.type}`
              //    @content="$event => $emit('content', $event)")
      // fullpage (description / coments / nodes)
    // transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="pageId"
      :style=`{
              position: 'relative',
              borderRadius: '20px 20px 0 0',
              height: bottomHeight + 'px',
            }`).row.full-width.b-30
      component(:is="'page-' + pageId"
        :item="item"
        :contentKalpa="item"
        :height="bottomHeight"
        @close="pageId=null")
    div(v-if="!pageId").row.full-width
      div(v-if="false").row.full-width.q-pt-xs.q-px-xs
        .row.col
          small(:style=`{lineHeight: 1.2}`).text-grey.q-pt-xs.q-px-xs {{$t('Ознакомительный фрагмент')}}
        .row.q-mr-sm
          q-btn(
            no-caps outline
            size="xs"
            color="green"
            :label="$t('Полный доступ')"
            @click="$router.push('/content/' + item.oid)"
          ).full-width
      div(@click="pageId='description'").row.full-width.items-center.content-center.wrap.q-pt-xs.q-pl-sm
        //q-icon(name="select_all" color="white" size="36px").q-mr-sm
        .row.col
          span(:style=`{lineHeight: 1.2, fontSize: '15px'}`).text-white.text-bold.full-width {{ item.name }}
          //small(:style=`{lineHeight: 1.2}`).text-grey.full-width {{$t('Ознакомительный фрагмент')}}
        q-btn(v-if="" round flat dense icon="expand_more" color="grey-5" @click="pageId='description'" :style=`{zIndex: '100'}`)
          q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Описание')}}
      .row.item-center.q-px-sm
        small(size="sm").row.items-center.text-grey-7.text-italic.q-pt-xs {{item.countStat.countViews}} {{$getNoun(item.countStat.countViews,$t('просмотр'),$t('просмотра'),$t('просмотров'))}}
        //.q-pa-sm.text-white {{ item.countStat.countSubscribers }}
        //  q-icon(name="bookmark_outline" color="white" size="20px").q-mx-xs
        //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Bookmarks')}}
        //.q-pa-sm.text-white {{ item.countStat.countNodes }}
        //  q-icon(name="adjust" color="white" size="20px").q-mx-xs
        //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Nodes')}}
        //.q-pa-sm.text-white {{ item.countStat.countJoints }}
        //  q-icon(name="fas fa-link" color="white" size="20px").q-mx-xs
        //    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Joints')}}
      .row.full-width.q-py-md
        q-btn(:to="'/user/'+item.author.oid" size="sm" round flat no-caps padding="none" :style=`{zIndex: '100'}`).q-px-sm
          q-avatar(:size="'30px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mr-xs
            //img(:src="item.author.thumbUrl" :to="'/user/'+item.author.oid")
            img(:src="item.author.thumbUrl" :to="'/user/'+item.author.oid")
            div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
          .column.items-start
            span(:style=`{fontSize: '12px'}`).text-grey-5 {{item.author.name}}
            small(v-if="author" :style=`{marginTop: '-4px', fontSize: '10px'}`).text-grey-7.text-italic {{author.countStat.countSubscriptions}} {{$getNoun(author.countStat.countSubscriptions,$t('подписчик'),$t('подписчика'),$t('подписчиков'))}}
        .col
        q-btn(flat no-caps=false size="sm" color="green-8" :label="$t('подписаться')")
      .row.full-width.items-center
        span(@click="pageId='nodes'").text-grey-5.q-py-sm.q-pl-sm {{$t('Популярные смыслы')}} {{ item.countStat.countNodes }}
        q-icon(@click="pageId='nodes'" dense name="expand_more" color="grey-5"  size="14px")
        list-feed-custom-horizontalPPV(
          ref="listFeed"
          :scrollAreaWidth="$store.state.ui.pageWidth"
          :scrollAreaHeight="120"
          :query="queryPopular"
          :itemWidthApprox="120*1.618"
          :itemHeightApprox="120"
          :itemActivePersist="itemActivePersist"
          @count="$emit('count', $event)"
          @items="$emit('items', $event)")
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload,scrolling}`)
            item-feed(
              :itemShortOrFull="item"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :scrolling="scrolling"
              :showContext="false"
              :height="120").q-px-xs
              template(v-slot:skeleton=`{queryInProgress}`)
                div(:style=`{width: 120*1.618+'px', height: 120+'px'}`).relative-position
                  q-skeleton(type='rect' height='100%' :animation="queryInProgress ? 'wave' : 'none'" dark).br-10
                  .row.full-width.absolute-bottom.justify-center
                    span.text-grey-5.text-h6 {{item.name}}
                  //.row.full-width.justify-center.q-pt-sm
                    q-skeleton(type='text' width='50%' :animation="queryInProgress ? 'wave' : 'none'" dark)
      .row.full-width.content-end.q-pt-md
        div(@click="pageId='comments'").cursor-pointer.row.full-width.items-center
          // div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
          span.text-grey-5.q-px-sm {{$t('Comments')}}
          span.text-grey-8 {{item.countStat.countComments}}
          .col
          q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="grey-5" :style=`{zIndex: '100'}`  @click="pageId='comments'")
          div(v-if="item.commentStat.topComment").row.full-width.items-center
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
        //    page-comments(v-if="pageId === 'comments'" :item="item")
        //    page-nodes(v-if="pageId === 'nodes'" :sphere="item" :height="700")
        //    item-description(v-if="pageId === 'description'" :item="item" :height="700")
        //    //page-joints(v-if="pageId === 'joints'" :sphere="item" :height="700")
        //    //page-similar(v-if="pageId === 'similar'" :node="item" :types="['VIDEO', 'BOOKS', 'IMAGE']")
      //.row
      //  q-btn(
      //    no-caps
      //    color="green"
      //    :label="$t('Полный доступ')"
      //    @click="$router.push('/content/' + item.oid)"
      //  ).col.full-width.q-mx-xs
        //kalpa-save(:item="item" :isActive="true" :showHeader="false" inactiveColor="grey-9").q-mx-xs
</template>

<script>
import {ContentApi} from 'src/api/content'
import contentPlayer from 'src/components/content_player'
import pageComments from '../../../../pages/app/node/page_comments';
import pageDescription from 'src/components/kalpa_item/item_card/viewer/video/page_description.vue'
import pageSimilar from '../../../../pages/app/node/page_similar';
import listFeedCustomHorizontalPPV from 'src/components/list_feed/list_feed_horizontal_custom_ppv.vue'
import pageNodes from 'src/pages/app/content/layout_video/page_nodes'
import {RxCollectionEnum} from '../../../../system/rxdb';

export default {
  name: 'typeVideo',
  props: ['item', 'isActive'],
  components: {
    contentPlayer,
    pageComments,
    pageDescription,
    pageSimilar,
    listFeedCustomHorizontalPPV,
    pageNodes
  },
  data() {
    return {
      playerReady: false,
      showDialog: false,
      pageId: null, // description|comments|nodes
      bottomHeight: null,
      author: null,
      promoCode: '',
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
    queryPopular () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.item.oid,
          sortStrategy: 'ACTIVITY', // 'ACTIVITY', // AGE
          stack: 'item0'
        },
        populateObjects: false
      }
    }
  },
  async mounted() {
    // this.$log('item!!!!!=', JSON.parse(JSON.stringify(this.item)))
    this.author = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.author.oid)
  }
}
</script>
