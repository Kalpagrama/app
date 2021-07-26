<template lang="pug">
  .row.full-width.justify-center
    div(
      :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width
      q-btn(label="asasdasd")
</template>

<script>
import {
  Editor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'

export default {
  name: 'viewBlock',
  components: {
    EditorContent,
    BubbleMenu,
    FloatingMenu,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit],
      content: `
        <p>
          Начните писать свою книгу.
        </p>
      `,
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
