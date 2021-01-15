<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header(
    reveal
    )
    .row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
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
              //- q-icon(name="bookmark_outline" size="24px").q-mr-xs
              span(:style=`{fontSize: '18px'}`).text-white.text-bold Закладки
          q-btn(round flat color="white" icon="search")
        //- tabs
        //- .row.full-width.q-px-sm
          q-tabs(
            v-model="pageId"
            switch-indicator no-caps dense
            active-color="green"
            ).full-width
            q-tab(
              v-for="(p,pi) in pages" :key="p.id"
              :name="p.id" :label="p.name")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '40px',
        paddingBottom: '100px',
      }`)
      q-tab-panels(
        v-model="pageId"
        swipeable animated
        :style=`{}`).b-30
        q-tab-panel(
          v-for="(p,pi) in pages" :key="p.id" :name="p.id"
          :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).full-width.items-start.content-start.justify-center.q-pa-sm
          kalpa-loader(
            :immediate="true"
            :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
            div(
              :style=`{
                maxWidth: $store.state.ui.pageWidth+'px',
              }`
              ).row.full-width.items-start.content-start
              //- item-content()
              component(
                v-for="(b,bi) in items" :key="b.oid"
                :is="'item-'+pageId"
                :bookmark="b")
      q-page-sticky(
        expand position="top-left" :offset="[0, 0]").row.full-width.q-px-md.b-30
        q-tabs(
          v-model="pageId"
          switch-indicator no-caps dense
          active-color="green"
          ).full-width.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'workspace_bookmarks',
  components: {
    itemContent: () => import('./item_content.vue'),
  },
  data () {
    return {
      pageId: 'content',
    }
  },
  computed: {
    pages () {
      return [
        // {id: 'video', name: 'Видео'},
        // {id: 'image', name: 'Картинки'},
        // {id: 'audio', name: 'Аудио'},
        // {id: 'book', name: 'Книги'},
        {id: 'content', name: 'Контент'},
        {id: 'nodes', name: 'Ядра'},
        {id: 'joints', name: 'Связи'},
        {id: 'people', name: 'Люди'},
        {id: 'spheres', name: 'Сферы'}
      ]
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        },
        sort: [{createdAt: 'desc'}]
      }
      if (this.pageId === 'content') {
        res.selector.type = {$in: ['IMAGE', 'VIDEO', 'BOOK']}
      }
      else if (this.pageId === 'nodes') {
        res.selector.type = {$in: ['NODE']}
      }
      else if (this.pageId === 'joints') {
        res.selector.type = {$in: ['JOINT']}
      }
      // else if ()
      return res
    }
  }
}
</script>
