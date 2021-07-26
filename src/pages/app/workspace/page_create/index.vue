<template lang="pug">
kalpa-layout()
  template(v-slot:body)
    .row.full-width.items-start.content-start
      .row.full-width.justify-center.q-pa-sm
        div(
          :style=`{
            height: '60px',
            maxWidth: $store.state.ui.pageWidth+'px',
            background: 'rgb(40,40,40)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col
            .row.fit.items-center.content-center.justify-center.q-pa-sm
              span(:style=`{fontSize: '18px',}`).text-white.text-bold {{$t('Create')}}
          q-btn(round flat color="white" icon="more_vert")
      .row.full-width
        component(
          :is="'view-'+pageId"
          @started="pageStarted = true")
//- q-layout(
  view="hHh Lpr lff")
  q-header()
  q-page-container
    q-page
      component(
        :is="'view-'+pageId"
        @started="pageStarted = true")
      q-page-sticky(
        v-if="!pageStarted"
        expand position="bottom"
        :offset=`[0,80]`
        :style=`{zIndex: 1000,}`
        ).row.full-width.justify-center
        q-btn-group(
          flat no-caps
          :style=`{
            borderRadius: '10px',
          }`).b-40
          q-btn(
            @click="pageId = p.id"
            v-for="(p,pi) in pages" :key="p.id"
            flat no-caps
            :color="pageId === p.id ? 'green' : 'grey-6'")
            span {{ p.name }}
</template>

<script>
import viewArticle from './view_article/index.vue'
import viewUpload from './view_upload/index.vue'
import viewBlock from './view_block/index.vue'

export default {
  name: 'workspace_pageCreate',
  components: {
    viewArticle,
    viewUpload,
    viewBlock,
  },
  data () {
    return {
      pageStarted: false,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'upload', name: 'Загрузить'},
        {id: 'write', name: 'Статья/Книга'},
        // {id: 'stream', name: 'Stream'},
      ]
    },
    pageId () {
      switch (this.$route.query.mode) {
        case 'upload': return 'upload'
        case 'article': return 'article'
        case 'block': return 'block'
        default: throw new Error('bad mode: ' + this.$route.query.mode)
      }
    }
  }
}
</script>
