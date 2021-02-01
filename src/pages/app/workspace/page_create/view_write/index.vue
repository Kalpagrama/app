<style lang="sass">
.ProseMirror
  height: 100%
  :focus
    outine: none !important
    outline-color: transparent !important
    outline-style: none !important
.ProseMirror-focused
  outine: none !important
  border: none !important
  :focus
    outine: none !important
</style>

<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width
    editor-menu-bar(:editor="editor" v-slot="{ commands, isActive }")
      .row.full-width.bg-red
        small isActive {{isActive}}
    editor-content(
      v-if="editor"
      :editor="editor"
      :style=`{
        height: '600px',
        color: 'black',
        padding: '10px',
      }`).full-width.bg-white.br
</template>

<script>
// import tiptap
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import { Heading, Bold, Italic, Link, HardBreak, } from 'tiptap-extensions'
import 'tiptap/src/style.css'

export default {
  name: 'viewWrite',
  components: {
    EditorMenuBar,
    EditorContent
  },
  data () {
    return {
      editor: null
    }
  },
  mounted () {
    this.$log('mounted')
    this.editor = new Editor({
      content: '<h1>hello kalpa</h1>',
      extensions: [
        new Bold(),
        new Italic(),
        new Link(),
        new HardBreak(),
        // The editor will accept paragraphs and headline elements as part of its document schema.
        new Heading(),
      ],
      onInit: () => {
        // editor is initialized
      },
      onUpdate: ({ getHTML }) => {
        // get new content on update
        const newContent = getHTML()
      },
    })
  }
}
</script>
