<template lang="pug">
//- composition name
q-btn(
  v-if="active && !mini"
  @click="contentClick()"
  flat color="white" no-caps
  icon="select_all"
  :round="$q.screen.xs"
  :style=`{
    position: 'absolute', zIndex: 2000,
    top: '8px', left: '8px',
    transform: 'translate3d(0,0,0)',
    background: 'rgba(0,0,0,0.2)',
  }`)
  span(v-if="!$q.screen.xs").q-ml-xs.text-white {{ contentName }}
  //- composition editor
  q-dialog(v-model="compositionEditorOpened" position="bottom")
    ws-composition-editor(
      v-if="compositionTemp"
      @close="compositionEditorOpened = false"
      :value="compositionTemp"
      :style=`{
        height: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
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
    }
  },
  computed: {
    contentName () {
      return this.content ? this.content.name.slice(0, 50) : ''
    }
  },
  watch: {
    compositionTemp: {
      deep: true,
      async handler (to, from) {
        this.$log('compositionTemp TO', to)
        if (this.compositionChanged) return
        this.compositionChanged = true
        this.compositionTemp = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, this.compositionTemp)
      }
    }
  },
  methods: {
    async contentClick () {
      this.$log('contentClick')
      if (this.player) this.player.pause()
      this.compositionTemp = await this.compositionInput(this.content)
      this.compositionEditorOpened = true
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
