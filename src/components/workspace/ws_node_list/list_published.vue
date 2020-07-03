<style lang="sass" scoped>
.node-saved
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- node editor...
  q-dialog(v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      ctx="workspace"
      :value="node"
      @published="nodePublished"
      @close="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  //- node player...
  q-dialog(v-model="nodePreviewOpened" position="bottom")
    div(
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: '800px',
        borderRadius: '10px',overflow: 'hidden',
      }`).column.b-50
      .col.full-width
        node(:node="nodePreview" :nodeFullReady="nodePreview" :active="true" :visible="true" :mini="false")
        .row.full-width.justify-center.q-pa-sm
          q-btn(
            @click="nodeFork()"
            push color="green" no-caps icon="photo_filter"
            :style=`{height: '50px',maxWidth: '600px'}`).full-width {{$t('node_fork', 'Взять и изменить')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-sm
      div(
        v-for="(i,ii) in items" :key="i"
        :style=`{
          position: 'relative',
          height: '100px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.full-width.node-saved.b-60.q-mb-sm
        img(
          @click="nodePreviewStart(i,ii)"
          :src="i.thumbOid" :style=`{height: '100%',borderRadius: '10px',overflow: 'hidden',}`)
        div(
          @click="nodePreviewStart(i,ii)"
          ).col.full-height
          .row.fit.items-start.content-start.q-pa-md
            span.text-white.text-bold {{ i.name }}
        .row.full-height.items-start.content-start
          q-btn(round flat dense color="red" icon="delete_outline" @click="nodeDelete(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodeList-listSaved',
  props: ['items'],
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
      nodePreview: null,
      nodePreviewOpened: false,
    }
  },
  methods: {
    async nodePreviewStart (n, ni) {
      this.$log('nodePreview', n, ni)
      this.nodePreview = await this.$rxdb.get(RxCollectionEnum.OBJ, n.oid)
      this.nodePreviewOpened = true
      this.node = JSON.parse(JSON.stringify((n)))
    },
    async nodeFork () {
      this.$log('nodeFork')
      this.nodePreviewOpened = false
      await this.$wait(300)
      this.nodeEditorOpened = true
    },
    async nodeDelete (n, ni) {
      this.$log('nodeDelete', n, ni)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(n.id)
    }
  }
}
</script>
