<style lang="sass" scoped>
.node-saved
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- node add...
  q-btn(
    @click="nodeAdd()"
    push round color="green" icon="add"
    :size="$q.screen.gt.xs ? 'xl' : 'lg'"
    :style=`{
      position: 'absolute', zIndex: 1000, right: '10px',
      bottom: $q.screen.width > 1260 ? 10+'px' : 60+10+'px',
      borderRadius: '50%'
    }`)
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
  //- body
  .col.full-width.scroll
    .row.fit.items-start.content-start.justify-center.q-py-sm
      div(
        v-if="items.length > 0").row.full-width.items-start.content-start
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
            @click="nodeEdit(i,ii)"
            :src="i.thumbOid" :style=`{height: '100%',borderRadius: '10px',overflow: 'hidden',}`)
          div(
            @click="nodeEdit(i,ii)"
            ).col.full-height
            .row.fit.items-start.content-start.q-pa-md
              span.text-white.text-bold {{ i.name }}
          .row.full-height.items-start.content-start
            q-btn(round flat dense color="red" icon="delete_outline" @click="nodeDelete(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodeList-listDraft',
  props: ['items'],
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
    }
  },
  methods: {
    async nodePreviewStart (n, ni) {
      this.$log('nodePreview', n, ni)
      this.nodePreview = await this.$rxdb.get(RxCollectionEnum.OBJ, n.oid)
      this.nodePreviewOpened = true
      this.node = JSON.parse(JSON.stringify((n)))
    },
    async nodeEdit (n, ni) {
      this.$log('nodeFork', n, ni)
      this.node = n
      this.nodeEditorOpened = true
    },
    async nodeAdd (nodeInput) {
      this.$log('nodeAdd start')
      if (!nodeInput) {
        nodeInput = {
          name: '',
          wsItemType: 'WS_NODE',
          items: [],
          spheres: [],
          category: 'FUN',
          layout: 'PIP',
          stage: 'draft'
        }
      }
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      this.nodeEdit(item)
    },
    async nodePublished (oid) {
      this.$log('nodePublished')
      // this.$router.push(`/user/${this.$store.getters.currentUser().oid}`).catch(e => e)
      await this.$wait(300)
      this.$router.push(`/node/${oid}`)
    },
    async nodeDelete (n, ni) {
      this.$log('nodeDelete', n, ni)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(n.id)
    }
  }
}
</script>
