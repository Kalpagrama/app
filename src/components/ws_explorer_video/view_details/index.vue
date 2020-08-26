<template lang="pug">
//- q-page(
  :style=`{
    position: 'fixed', zIndex: 99999, top: 0, left: 0, right: 0, bottom: 0,
  }`).fit
  div(:style=`{position: 'relative',}`).row.fit.items-start.content-start
    q-btn(
      round flat color="white" icon="keyboard_arrow_left"
      :style=`{position: 'absolute', zIndex: 100, left: '8px', top: '8px',}`)
    img(
      :src="contentKalpa.thumbUrl" draggable="false"
      :style=`{
        height: '100%',
        objectFit: 'contain',
      }`).full-width
    ws-content-player(
      :contentKalpa="contentKalpa" :contentWorkspace="contentWorkspace"
      @player="player = $event"
      @error="playerErrorHandle"
      :style=`{
        position: 'absolute', zIndex: 90, top: '0px',
        borderRadius: '10px', overflow: 'hidden',}`).fit
        template(v-slot:actions)
          q-btn(
            @click="$refs[`page-${pageId}`].nodeCreateStart()"
            round push color="green" dense icon="add"
            :style=`{borderRadius: '50%'}`)
q-page.row.full-width.justify-center
  div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.items-start.content-start.justify-center
    div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
      img(
        :src="contentKalpa.thumbUrl" draggable="false"
        :style=`{
          borderRadius: '10px', overflow: 'hidden'
        }`).full-width
      ws-content-player(
        :contentKalpa="contentKalpa" :contentWorkspace="contentWorkspace"
        @player="player = $event"
        @error="playerErrorHandle"
        :style=`{
          position: 'absolute', zIndex: 90, top: '0px',
          borderRadius: '10px', overflow: 'hidden',}`).fit
</template>

<script>
import wsContentPlayer from 'components/ws_content_player/index.vue'

export default {
  name: 'wsContentExplorer_video_viewDetails',
  props: ['contentKalpa', 'contentWorkspace'],
  components: {wsContentPlayer},
  data () {
    return {
      player: null,
    }
  }
}
</script>
