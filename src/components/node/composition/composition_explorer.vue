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
  //- content explorer
  q-dialog(v-model="contentExplorerOpened" position="bottom")
    ws-content-explorer(
      v-if="contentExplorerItem"
      :value="contentExplorerItem"
      @close="contentExplorerOpened = false"
      @compositionAdded="compositionAdded"
      :options=`{
        ctx: 'explorer',
      }`
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
      }`).b-50
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'contentClick',
  props: ['visible', 'active', 'mini', 'composition', 'content', 'player'],
  data () {
    return {
      compositionTemp: null,
      compositoinChanged: false,
      compositionEditorOpened: false,
      contentExplorerItem: null,
      contentExplorerOpened: false,
      compositionAddedCount: 0,
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
    async compositionAdded (composition) {
      this.$log('compositionAdded', composition)
      this.compositionAddedCount += 1
      if (this.compositionAddedCount === 1) {
        this.$log('ADD CONTENT TO WS ON FIRST COMPOSITION ADDED')
        let {items: contentFind} = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
            contentOid: this.content.oid,
            contentType: {$ne: 'COMPOSITION'}
          }
        })
        this.$log('contentFind', contentFind)
        if (contentFind.length === 0) {
          let contentInput = {
            wsItemType: 'WS_CONTENT',
            thumbOid: this.content.thumbUrl,
            name: this.content.name,
            layers: [],
            spheres: [],
            contentOid: this.content.oid,
            contentType: this.content.type,
            operation: {items: null, operations: null, type: 'CONCAT'}
          }
          this.$log('contentAdd contentInput', contentInput)
          let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        }
      }
      else {
        this.$q.notify('Good added: ' + this.compositionAddedCount)
      }
    },
    async compositionInput (content) {
      this.$log('compositionInput content', content)
      let compositionInput = {
        wsItemType: 'WS_CONTENT',
        thumbOid: content.thumbUrl,
        contentOid: content.oid,
        contentType: 'COMPOSITION',
        name: this.composition.name,
        layers: this.composition.layers.map((l, li) => {
          return {
            id: `${Date.now()}::${li}`,
            color: this.$randomColor(`${Date.now()}::${li}`),
            contentOid: content.oid,
            figuresAbsolute: l.figuresAbsolute,
            figuresRelative: [],
            // spheres: [{name: ''}],
            spheres: []
          }
        }),
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      this.$log('compositionInput done', compositionInput)
      // let composition = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, compositionInput)
      return compositionInput
    },
    compositionSave () {
      this.$log('compositionSave')
    }
  }
}
</script>
