<template lang="pug">
  kalpa-layout()
    template(v-slot:body)
      //- nav header
      .row.full-width.items-start.content-start.justify-center
        // nav header
        div(v-if="false" :style=`{ height: '60px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col.full-height
            .row.fit.items-center.content-center.justify-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('essences')}}
          q-btn(round flat color="white" icon="more_vert")
        //q-spinner-dots(v-if="!node" color="green" size="60px").fixed-center
        div(v-else :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          // образ
          div(:style=`{width: $store.state.ui.pageWidth + 'px'}`).row-full-width
            q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
            item-feed(
              :itemShortOrFull="node"
              :isActive="isActive"
              :isVisible="true"
              :showHeader="false"
              :showActions="false"
              :showName="false"
              :showSpheres="false")
          // fullpage
          transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            div(
              v-if="pageId"
              :style=`{
                position: 'relative',
                borderRadius: '20px 20px 0 0',
                height: bottomHeight + 'px',
              }`).row.full-width.b-30
              component(:is="'page-' + pageId" :node="node" :height="bottomHeight" @close="pageId=null" @itemEditorShow="isActive=!$event")
          // author + essence + spheres
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId" :style=`{position: 'relative', border: '1px solid grey', borderRadius: '10px'}`).row.full-width
              q-btn(round flat icon="unfold_more" color="white" @click="pageId='essences'").absolute-top-right
              .row.full-width
                q-btn(:to="'/user/'+node.author.oid" size="sm" round flat color="grey" no-caps padding="none").q-pl-xs.q-pt-xs
                  q-avatar(:size="'20px'")
                    img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
                  span() {{node.author.name}}
              .col
              span(:style=`{
                    fontSize: fontSize+'px',
                    textAlign: 'center',
                  }`).text-white.full-width.q-pl-xl {{node.name}}
              //- SPHERES
              essence-spheres(
                v-if="node.spheres.length > 0"
                :node="node"
                :itemState="{}")
              //essence-actions(
              //  :essence="node"
              //  :itemState="{}"
              //  :nodeBackgroundColor="'rgb(30,30,30)'"
              //  :nodeActionsColor="'rgb(200,200,200)'"
              //  :isActive="true"
              //  :isVisible="true")
          // description
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId").row.full-width.items-center
              //q-separator(dark).full-width
              span.text-grey.q-pl-sm {{node.description}} длинное описание...
              .col
              q-btn(round flat icon="unfold_more" color="white" @click="pageId='description'")
          // comments
          transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
            div(v-if="!pageId").row.full-width.items-center
              q-separator(dark).full-width
              span.text-grey.q-pl-sm {{$t('Comments')}} ● {{node.countStat.countComments}}
              .col.scroll.q-px-md
                div(v-if="node.commentStat.topComment").row.full-width.items-center.content-center.no-wrap
                  span.text-grey.text-weight-thin.text-italic.q-pr-md {{node.commentStat.topComment.text}}
                  q-btn(v-for="(c,id) in node.commentStat.randomComments" :key="id"
                    :to="'/user/'+c.author.oid" size="sm" round flat color="grey" no-caps padding="none"
                    :style=`{ whiteSpace: 'nowrap' }`).q-pl-xs
                    q-avatar(:size="'20px'")
                      img(:src="c.author.thumbUrl" :to="'/user/'+c.author.oid")
                    // span() {{c.author.name}}
              q-btn(round flat icon="unfold_more" color="white" @click="pageId='comments'")
          page-similar(v-if="!pageId" :node="node")
          //// суть + смыслы + автор
          //.row.full-width
          //  div(:style=`{height: '200px'}`) essence + author
          //// actions
          //div(:style=`{height: '150px', width: 'auto'}`).row.full-width.no-wrap.scroll
          //  q-btn(v-for="(n, i) in 100"  round flat color="white" icon="clear")
          // comments

          //// similar
          //.row.full-width
          //  div(:style=`{height: '200px'}`) similar
          //q-expansion-item(group="somegroup" icon="chat" :label="$t('Description')" dark).col-12
          //  // template(v-slot:header)
          //  // todo самый лучший коммент
          //  row.full-width
          //    q-btn(v-for="(n, i) in 10"  round flat color="white" icon="add")

</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'

export default {
  name: 'pageApp_node2',
  components: {pageSimilar, pageComments, pageDescription, pageEssences, essenceActions, essenceSpheres},
  data () {
    return {
      node: null,
      slide: 1,
      pageId: null,
      bottomHeight: 0,
      isActive: true
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    }
  },
  async mounted () {
    this.$log('mounted', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
