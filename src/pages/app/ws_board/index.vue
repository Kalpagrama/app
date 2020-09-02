<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40.q-pa-xs
              q-icon(name="view_module" color="white" size="30px").q-mx-sm
              div(:style=`{overflowX: 'auto'}`).col
                span(
                  v-if="board"
                  :style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ board.name }}
              q-btn(round flat color="grey-8" icon="more_vert")
              //- q-btn(
                flat no-caps
                :to="`/trends/${categoryOid}`"
                :style=`{fontSize: '16px'}`
                ).text-white.text-bold.q-px-sm {{ categoryName }}
            div(:style=`{paddingLeft: '14px',}`).row.full-width.justify-start
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          div(
            v-if="board && viewId === 'items'").row.full-width
            img(
              v-for="(i,ii) in 20" :key="ii"
              :src="board.thumbOid"
              :style=`{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden',
              }`).q-mr-sm.q-mb-sm
          div(
            v-if="board && viewId === 'more'").row.full-width
            img(
              v-for="(i,ii) in 100" :key="ii"
              :src="board.thumbOid"
              :style=`{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden',
              }`).q-mr-sm.q-mb-sm
//- ws-content-explorer(
//-   v-if="contentKalpa && contentWorkspace"
//-   :contentWorkspace="contentWorkspace"
//-   :contentKalpa="contentKalpa"
//-   @out="outHandle")
//- .row.full-width
  q-btn(round flat color="white" icon="keyboard_arrow_back" @click="$router.back()").q-mr-sm
  span(:style=`{fontSize: '18px',}`).text-white {{ board }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
// import wsContentExplorer from 'components/ws_content_explorer/index.vue'

export default {
  name: 'pageApp_wsBoard',
  // components: {wsContentExplorer},
  meta () {
    return {
      title: this.board ? this.board.name : ''
    }
  },
  data () {
    return {
      board: null,
      boardNew: {
        name: '',
        contentsOids: [],
      },
      viewId: 'items',
      views: [
        {id: 'items', name: 'Items'},
        {id: 'more', name: 'More ideas'}
      ]
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            this.board = JSON.parse(JSON.stringify(this.boardNew))
            // TODO: watch for the board...
            // if changed create it for real...
          }
          else {
            let {items: [item]} = await this.$rxdb.find({
              selector: {
                rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
                id: to
              }
            })
            this.board = item
          }
        }
      }
    }
  },
  methods: {
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
