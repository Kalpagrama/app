<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }
}
.ProseMirror:focus {
  outline: none;
}

.bubble-menu {
  display: flex;
  background-color: #0D0D0D;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: #FFF;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}

.floating-menu {
  display: flex;
  background-color: #0D0D0D10;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}
</style>
<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
    maxWidth: $store.state.ui.pageWidth+'px',
  }`
  ).row.full-width
    bubble-menu.bubble-menu(:tippy-options='{ duration: 100 }' :editor='editor' v-if='editor')
      button(@click='editor.chain().focus().toggleBold().run()' :class="{ 'is-active': editor.isActive('bold') }")
        span {{$t('Bold')}}
      button(@click='editor.chain().focus().toggleItalic().run()' :class="{ 'is-active': editor.isActive('italic') }")
        span {{$t('Italic')}}
      button(@click='editor.chain().focus().toggleStrike().run()' :class="{ 'is-active': editor.isActive('strike') }")
        span {{$t('Strike')}}
    floating-menu.floating-menu(:tippy-options='{ duration: 100 }' :editor='editor' v-if='editor')
      button(@click='editor.chain().focus().toggleHeading({ level: 1 }).run()' :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }")
        span {{$t('H1')}}
      button(@click='editor.chain().focus().toggleHeading({ level: 2 }).run()' :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }")
        span {{$t('H2')}}
      button(@click='editor.chain().focus().toggleBulletList().run()' :class="{ 'is-active': editor.isActive('bulletList') }")
        span {{$t('Bullet List')}}
    //editor-content(:editor='editor').full-width.bg-white
    editor-content(
      v-if="editor"
      :editor="editor"
      :style=`{
      height: '600px',
      color: 'black',
      background: '#c8c8c8',
      padding: '10px',
    }`).full-width
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
  name: 'viewArticle',
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

  beforeUnmount () {
    this.editor.destroy()
  },
}
</script>
