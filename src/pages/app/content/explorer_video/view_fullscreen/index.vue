<template lang="pug">
div(
  :style=`{
    position: 'fixed', zIndex: 99999,
    right: '8px',
    width: isOpened ? '500px' : '60px',
    height: '600px', top: 'calc(50% - 300px)',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.items-start.content-start.b-30
  //- body
  div(
    v-show="isOpened"
    :style=`{
      borderRadius: '10px',
    }`
    ).col.full-height.b-40
    view-fragments(
      v-if="viewId === 'fragments'"
      :player="player"
      :contentKalpa="contentKalpa"
      :contentWorkspace="contentWorkspace")
  //- right panel for views switching
  div(
    :style=`{
      width: '60px',
      borderRadius: 'none'
    }`
    ).column.full-height.items-start.content-start
    .col.full-width
      q-btn(
        v-for="v in views" :key="v.id"
        @click="viewId = v.id"
        round flat
        :color="v.id === viewId ? 'green' : 'white'"
        :style=`{
          height: '60px',
        }`
        ).full-width
        small(:style=`{fontSize: '20px',}`).text-bold {{ v.name.charAt(0) }}
    q-btn(
      @click="isOpened = !isOpened"
      round flat color="white"
      :icon="isOpened ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      :style=`{
        height: '60px',
      }`
      ).full-width
</template>

<script>
import viewFragments from '../view_fragments/index.vue'

export default {
  name: 'wsContentExplorer_video_viewFullscreen',
  props: ['contentKalpa', 'contentWorkspace', 'player'],
  components: {viewFragments},
  data () {
    return {
      viewId: 'fragments',
      isOpened: true,
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: 'Details'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'chains', name: 'Chains'}
      ]
    }
  }
}
</script>
