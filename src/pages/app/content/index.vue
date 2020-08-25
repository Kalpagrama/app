<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px',height: '50px',}`).row.full-width.items-center.content-center.q-px-sm
        q-icon(name="select_all" color="white" size="30px").q-mr-sm
        .col.full-height
          div(:style=`{overflow: 'hidden',}`).row.fit.items-center.content-center
            span(
              v-if="content"
              :style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-bold.text-white {{ content.name }}
        q-btn(round flat color="white" icon="bookmark_outline")
  q-page-container
    q-page(:style=`{paddingTop: '0px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          div(v-if="content" :style=`{position: 'relative'}`).row.full-width.items-start.content-start
            img(
              :src="content.thumbUrl" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden',}`
              ).full-width
            ws-content-player(
              :contentKalpa="content" :contentWorkspace="null"
              @player="player = $event"
              :style=`{position: 'absolute', zIndex: 100}`).fit
              template(v-slot:actions)
                q-btn(
                  round dense color="green" icon="add"
                  :style=`{borderRadius: '50%'}`)
          //- small.text-white {{content}}
          div(v-if="player").row.full-width
            span {{ player.currentTime }}
          router-view
      q-page-sticky(
        expand position="bottom" :style=`{zIndex: 100}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px', paddingLeft: '50px', paddingRight: '50px',}`).row.full-width
            q-tabs(
              :value="$route.name" @input="$router.replace({name: $event})"
              no-caps dense active-color="white").fit.text-grey-8
              q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import wsContentPlayer from 'components/ws_content_player/index.vue'

export default {
  name: 'pageApp__content',
  components: {wsContentPlayer},
  meta () {
    return {
      title: this.content?.name
    }
  },
  data () {
    return {
      content: null,
      player: null
    }
  },
  computed: {
    pages () {
      return [
        {id: 'content-details', name: 'Details'},
        {id: 'content-nodes', name: 'Nodes'},
      ]
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  }
}
</script>
