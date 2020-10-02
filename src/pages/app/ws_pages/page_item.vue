<style lang="sass">
.ProseMirror
  height: 100%
  padding: 4px 4px
  caret-color: rgb(75,172,79) !important
  border: 2px solid rgb(30,30,30)
  border-radius: 10px
  transition: all 0.5s ease
  &:focus
    outline: none;
    box-shadow: 0 0 0 4px rgb(75,172,79)
    border: 2px solid rgb(75,172,79)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',overflow: 'hidden'
  }`).row.full-width
  //- editor-menu-bar(:editor="editor" v-slot="{ commands }")
    .row.full-with.bg-red.q-pa-sm
      q-btn(round flat dense @click="showImagePrompt(commands.image)")
  editor-content(
    :editor="editor"
    autofocus
    :style=`{
      color: 'white'
    }`
    ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Heading, Bold, Italic, Link, HardBreak, Code, CodeBlock, CodeBlockHighlight, TrailingNode } from 'tiptap-extensions'
// custom extensions
// import ExtNode from './ext_node.js'
// import Iframe from './Iframe.js'

export default {
  name: 'pageItem',
  components: {
    EditorContent,
    EditorMenuBar
  },
  props: ['id'],
  data () {
    return {
      item: null,
      editor: new Editor({
        extensions: [
          new Heading(),
          new Bold(),
          new Italic(),
          new Link(),
          new HardBreak(),
          new Code(),
          new CodeBlock(),
          new CodeBlockHighlight(),
          new TrailingNode(),
          // custom
          // new Iframe(),
          // new ExtNode(),
        ],
        // content: '<iframe src="https://www.youtube.com/embed/hcPUoxTvw5g" frameborder="0" allowfullscreen></iframe>',
        onInit: () => {
          // editor is initialized
          this.$log('onInit')
        },
        onUpdate: ({ getHTML }) => {
          const newContent = getHTML()
          this.$log('newContent', newContent)
          this.item.name = newContent
        },
      })
    }
  },
  watch: {
    id: {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        let item = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
        // let [item] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE, id: to}})
        if (item) {
          this.item = item
          this.editor.setContent(this.item.name)
        }
      }
    }
  },
  methods: {
    showImagePrompt (command) {
      const src = prompt('Enter the url of your image here')
      if (src !== null) {
        command({ src })
      }
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.editor.destroy()
  }
}
</script>
