<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
textarea {
  resize: none;
}
</style>
<template lang="pug">
div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start
  div(:style=`{position: 'relative', minHeight: '74px', borderRadius: '0px 0px 0 0', overflow: 'hidden'}`).row.full-width.items-start.content-start
    //- actions
    q-btn(
      round flat icon="clear" color="red" :loading="fragmentDeleting" @click="fragmentDelete()"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.5)'}`
      ).shadow-5
    q-btn(
      round push color="green" @click="fragmentEdit()"
      :icon="fragmentEditing ? 'check' : 'edit'"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', bottom: '30px'}`)
    q-btn(
      round push color="green" @click="$emit('edited')"
      icon="keyboard_arrow_up"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', top: '16px'}`)
    fragment(
      ctx="inEditor" :fragment="fragment" ref="nodeFragment"
      @previewHeight="fragmentHeight = $event" @previewWidth="fragmentWidth = $event"
      @player="playerReady")
  //- editors
  fragment-editor-video(
    v-if="fragment && fragmentPlayer"
    :fragment="fragment" :player="fragmentPlayer" :width="fragmentWidth" :height="fragmentEditorVideoHeight"
    :editing="fragmentEditing" :now="$refs.nodeFragment.now"
    :style=`{
      overflow: 'hidden', marginTop: '-10px',
      maxWidth: $store.state.ui.pageMaxWidth+'px',
      height: fragmentEditorVideoHeight+'px'}`).row.full-width.bg-black
</template>

<script>
import fragment from '../fragment'
import fragmentEditorVideo from './fragment_editor_video'

export default {
  name: 'fragmentEditor',
  components: {fragment, fragmentEditorVideo},
  props: ['ctx', 'index', 'fragment'],
  data () {
    return {
      fragmentEditing: false,
      fragmentEditorVideoHeight: 10,
      fragmentDeleting: false,
      fragmentPlayer: null,
      fragmentHeight: 0,
      fragmentWidth: 0
    }
  },
  watch: {
    fragmentEditing: {
      handler (to, from) {
        this.$log('fragmentEditing CHANGED', to)
        if (to) {
          this.$emit('bg', 'black')
          this.$tween.to(this, 0.5, {fragmentEditorVideoHeight: 500})
        } else {
          this.$emit('bg', 'white')
          this.$tween.to(this, 0.5, {fragmentEditorVideoHeight: 10})
        }
      }
    }
  },
  methods: {
    fragmentPlay () {
      this.$log('fragmentPlay')
    },
    fragmentEdit () {
      this.$log('fragmentEdit')
      this.fragmentEditing = !this.fragmentEditing
    },
    async playerReady (player) {
      this.$log('PLAYER READY', player)
      this.fragmentPlayer = player
    },
    async fragmentDelete () {
      this.$log('fragmentDelete')
      this.fragmentDeleting = true
      await this.$wait(600)
      let confirmed = confirm('Delete fragment?')
      if (confirmed) {
        this.$emit('delete', this.index)
      }
      this.fragmentDeleting = false
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
