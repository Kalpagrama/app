<template lang="pug">
div(:style=`{position: 'relative', minWidth: colWidth+'px', width: width+'px', maxHeight: '100%'}`).column.fit
  //- dialog
  k-dialog(ref="fragmentDialog")
    node-fragment(
      v-if="fragment" :fragment="fragment" @delete="fragmentDelete(fragment.uid)"
      @editor="fragmentEditor(fragment)" @hide="$refs.fragmentDialog.hide()")
  //- editor
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(
      v-if="fragment" :content="fragment.content" :fragments="fragmentsEditing" :inEditor="true"
      @create="$event => fragmentCreate(fragment.content, $event)" @delete="fragmentDelete"
      @hide="$refs.videoEditorDialog.hide()")
  //- actions
  k-menu-popup(ref="fragmentMenu" :name="'fragment.name'" :actions="fragmentActions" @action="fragmentAction")
  //- body
  div(body-scroll-lock-ignore).col.scroll.q-px-sm
    div(:style=`{paddingBottom: '100px'}`).row.full-width.items-start.content-start.justify-center
      div(
        v-for="(f, fkey) in fragments" :key="fkey" @click="fragmentClick(f, fkey)"
        :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.bg-white.q-mt-sm.shadow-1
        img(
          :src="f.thumbUrl || f.content.thumbUrl[0]"
          :style=`{width: '100%', objectFit: 'contain'}` draggable="false")
        //- name with tags
        div(
          v-if="true"
          :style=`{position: 'absolute', bottom: '10px', left: '10px', borderRadius: '10px', overflow: 'hidden', opacity: 0.95}`).row.bg-grey-9.q-px-sm.q-py-xs
          span.text-white {{ f.name }}
      //- add fragment
      div(
        v-if="true"
        :style=`{position: 'relative', height: fragmentAddHeight+'px'}`
        ).row.full-width.items-center.content-center.justify-center
        q-btn(
          round outline color="primary" size="lg" icon="add" @click="$emit('create')")
        div(v-if="fragmentsEmpty").row.full-width.justify-center.q-py-sm
          span Добавить фрагмент
</template>

<script>
import nodeFragment from './node_fragment'

export default {
  name: 'nodeCreator__nodeFragments',
  components: {nodeFragment},
  props: ['colWidth', 'fragments'],
  data () {
    return {
      width: 500,
      fragment: null,
      fragmentAddHeight: 300,
      fragmentActions: [
        {id: 'edit', name: 'Edit'},
        {id: 'duplicate', name: 'Duplicate'},
        {id: 'delete', name: 'Delete', color: 'red'}
      ]
    }
  },
  computed: {
    fragmentsEmpty () {
      return Object.keys(this.fragments).length === 0
    },
    fragmentsEditing () {
      if (!this.fragment) return {}
      let fragments = {}
      for (const f in this.fragments) {
        if (this.fragments[f].content.oid === this.fragment.content.oid) {
          fragments[f] = this.fragments[f]
        }
      }
      return fragments
    }
  },
  watch: {
    fragments: {
      immediate: true,
      handler (to, from) {
        this.$log('fragments CHANGED', to)
        if (Object.keys(to).length > 0) this.$tween.to(this, 0.5, {fragmentAddHeight: 100})
        else this.$tween.to(this, 0.5, {fragmentAddHeight: this.$q.screen.height})
      }
    }
  },
  methods: {
    fragmentClick (f) {
      this.$log('fragmentClick', f)
      this.$set(this, 'fragment', f)
      this.$nextTick(() => {
        // this.$refs.fragmentMenu.show()
        this.$refs.fragmentDialog.show()
      })
    },
    fragmentAction ({id}) {
      this.$log('fragmentAction', id)
      switch (id) {
        case 'edit': {
          this.fragmentEdit()
          break
        }
        case 'duplicate': {
          this.fragmentDuplicate(this.fragment)
          break
        }
        case 'delete': {
          this.fragmentDelete(this.fragment.uid)
          break
        }
      }
    },
    fragmentCreate (content, f) {
      this.$log('fragmentCreate')
      let uid = f && f.uid ? f.uid : `${content.oid}-${Date.now()}`
      let fragment = null
      switch (content.type) {
        case 'VIDEO': {
          fragment = {
            uid: uid,
            url: '',
            name: f && f.name ? f.name : '',
            relativePoints: f && f.relativePoints ? f.relativePoints : [{x: 0}, {x: 10}],
            relativeScale: content.duration,
            content: content,
            thumbUrl: content.thumbUrl[0]
          }
          this.$set(this.fragments, uid, fragment)
          // this.$refs.videoEditorDialog.show()
          break
        }
        case 'IMAGE': {
          fragment = {
            uid: uid,
            url: '',
            name: '',
            relativePoints: [],
            relativeScale: 0.00,
            content: content,
            thumbUrl: content.thumbUrl[0]
          }
          this.$set(this.fragments, uid, fragment)
          // this.$refs.imageEditorDialog.show()
          break
        }
      }
    },
    fragmentEditor (f) {
      this.$log('fragmentEditor', f.content.type)
      switch (f.content.type) {
        case 'VIDEO': {
          this.$refs.videoEditorDialog.show()
          break
        }
        case 'IMAGE': {
          this.$refs.imageEditorDialog.show()
          break
        }
      }
    },
    fragmentDuplicate (f) {
      this.$log('fragmentDuplicate')
      let uid = `${f.content.oid}-${Date.now()}`
      let fragment = JSON.parse(JSON.stringify(f))
      fragment.uid = uid
      this.$set(this.fragments, uid, fragment)
    },
    fragmentDelete (uid) {
      this.$log('fragmentDelete')
      if (!uid) return
      this.$delete(this.fragments, uid)
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
