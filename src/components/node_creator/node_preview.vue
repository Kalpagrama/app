<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.q-px-sm
  //- body
  div(:style=`{position: 'relative'}` body-scroll-lock-ignore).col.scroll
    //- node for preview
    node(:node="node" :nodeFullReady="node" inCreator :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).bg-white.q-my-sm
    //- node edit btn
    q-btn(v-if="false" :style=`{position: 'absolute', zIndex: 1000, right: '15px', top: '20px', opacity: 0.9}`
      round flat dense icon="edit" color="white").bg-grey-9
    div(:style=`{zIndex: 10, marginTop: '-20px', borderRadius: '0 0 10px 10px', opacity: 0.8}`).row.full-width.items-end.bg-grey-2.q-pa-sm.q-pt-md
      .row.full-width.q-py-sm
        q-btn(outline color="primary" style=`width: 50px; height: 50px; borderRadius: 10px`
          :loading="nodeSaving"
          icon="refresh" @click="$emit('reset')").q-mr-sm
          q-tooltip Сохранить и создать новое
        .col
          q-btn(outline color="primary" no-caps style=`height: 50px; borderRadius: 10px` @click="$emit('edit')").full-width
            span.text-bold Редактировать
      q-btn(
        no-caps color="primary" style=`height: 60px; borderRadius: 10px`
        :disable="!nodePublishPossible" :loading="nodePublishing" @click="$emit('publish')").full-width.q-mb-sm
        span.text-bold.text-white Опубликовать
    div(:style=`{height: '60px'}`).row.full-width
</template>

<script>
import node from 'components/node'

export default {
  name: 'nodeCreator__nodePreview',
  components: {node},
  props: ['node', 'nodePublishPossible', 'nodeSaving', 'nodePublishing'],
  data () {
    return {
    }
  },
  mounted () {
    this.$log('monted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
