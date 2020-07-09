<template lang="pug">
//- composition name
q-btn(
  v-if="active && !mini"
  @click="contentClick()"
  flat color="white" no-caps
  icon="select_all"
  :round="$q.screen.xs"
  :style=`{
    position: 'absolute', zIndex: 9999,
    top: '8px', left: '8px',
    transform: 'translate3d(0,0,0)',
    background: 'rgba(0,0,0,0.2)',
  }`)
  span(v-if="!$q.screen.xs").q-ml-xs.text-white {{ contentName }}
  //- composition.content explorer
  q-dialog(v-model="contentExplorerOpened" position="bottom")
    ws-content-explorer(
      v-if="contentExplorerItem"
      :value="contentExplorerItem"
      @close="contentExplorerOpened = false"
      @compositionAdded="compositionAdded"
      @open="contentOpen"
      :options=`{
        ctx: 'explorer',
        startAt: compositionStart,
      }`
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
      }`).b-50
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionExplorer',
  props: ['visible', 'active', 'mini', 'composition', 'content', 'player'],
  data () {
    return {
      compositionTemp: null,
      compositoinChanged: false,
      compositionEditorOpened: false,
      contentExplorerItem: null,
      contentExplorerOpened: false,
      compositionAddedCount: 0,
      compositionStart: null
    }
  },
  computed: {
    contentName () {
      return this.content ? this.content.name.slice(0, 50) : ''
    }
  },
  watch: {
  },
  methods: {
    async contentClick () {
      this.$log('contentClick')
      if (this.player) this.player.pause()
      // get composition start
      this.compositionStart = this.getCompositionStart()
      this.contentExplorerItem = this.contentInput(this.content)
      this.contentExplorerOpened = true
    },
    contentInput (content) {
      this.$log('contentInput', content)
      let input = {
        wsItemType: 'WS_CONTENT',
        thumbOid: content.thumbUrl,
        contentOid: content.oid,
        contentType: content.type,
        name: content.name,
        layers: [],
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      return input
    },
    async contentOpen () {
      this.$log('contentOpen')
      let content = await this.contentAddToWorkspace(this.content)
      this.$router.push(`/workspace/content/${content.id}`)
    },
    async contentAddToWorkspace (content) {
      this.$log('contentAddToWorkspace start')
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid,
          contentType: {$ne: 'COMPOSITION'}
        }
      })
      this.$log('contentFind', contentFind)
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {items: null, operations: null, type: 'CONCAT'}
        }
        this.$log('contentAddToWorkspace contentInput', contentInput)
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAddToWorkspace done', res)
        return res
      }
      else {
        return contentFind[0]
      }
    },
    async compositionAdded (composition) {
      this.$log('compositionAdded', composition)
      this.compositionAddedCount += 1
      if (this.compositionAddedCount === 1) {
        this.contentAddToWorkspace(this.content)
      }
    },
    getCompositionStart () {
      return this.composition.layers[0].figuresAbsolute[0].t
    }
  }
}
</script>
