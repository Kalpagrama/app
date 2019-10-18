<template lang="pug">
q-layout(view='hHh Lpr fFf' :container="true")
  //- action add
  q-btn(
    round color="green" icon="add" size="lg" @click="$refs.contentFinderDialog.show()"
    :style=`{position: 'fixed', zIndex: 1000, bottom: '14px', right: '14px'}`)
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="fragmentsEmpty"
      :style=`{position: 'fixed', bottom: '20px', right: '80px', height: '50px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.items-center.bg-white.q-px-md
      span Добавьте фрагментов!
      q-icon(name="keyboard_arrow_right" color="black" size="28px")
  //- content finder dialog
  k-dialog(ref="contentFinderDialog" :value="false")
    content-finder(@content="contentSelected" @close="$refs.contentFinderDialog.hide()")
  //- video editor
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(
      v-if="fragment" :fragmentInput="fragment" :inCreator="true"
      @fragment="fragments[fragment.uid] = $event, $refs.videoEditorDialog.hide(), fragment = null")
  //- actions
  k-menu-popup(ref="fragmentDeleteMenu" name="Удалить фрагмент?" :actions="[{id: 'delete', name: 'Удалить'}]" @action="fragmentDelete(fragment.uid), fragment = null")
  k-menu-popup(ref="pointEditMenu" :name="fragment ? fragment.name : ''" :actions="[{id: 'edit', name: 'Изменить'}, {id: 'delete', name: 'Удалить'}]" @action="$event => pointEdit(fragment, point, $event)")
  //- k-menu-popup(ref="fragmentMenu" :name="'fragment.name'" :actions="fragmentActions" @action="fragmentAction")
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md.bg-primary
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.go(-1)")
      .col.full-height
        .row.fit.items-center.justify-center
          span.text-bold.text-white Фрагменты
      q-btn(round flat color="white" icon="keyboard_arrow_right" @click="$emit('next')")
  q-page-container
    //- body
    div(body-scroll-lock-ignore).col.scroll.q-px-sm
      //- wrapper
      div(:style=`{paddingBottom: '60px'}`).row.full-width.items-start.content-start.justify-center
        //- fragment
        div(
          v-for="(f, fkey) in fragments" :key="fkey"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-lg
          //- header
          div(
            :style=`{height: '50px'}`
            ).row.full-width.items-center.bg-white
            .col.full-height
              //- name preview
              div(v-if="nameEdit !== fkey" @click="fragmentNameClick(f)").row.fit.items-center.q-pl-sm
                span().text-bold {{ f.name || 'Enter fragment name' }}
              //- name input
              div(v-if="nameEdit === fkey").row.fit.items-center.q-pl-sm
                input(
                  ref="nameInput" :value="name" @input="f.name = $event.target.value"
                  @blur="nameEdit = undefined" @keyup.enter="nameEdit = undefined"
                  :style=`{border: 'none', height: '30px', borderRadius: '4px', paddingLeft: '4px'}`
                  ).full-width.bg-grey-3.kinput
            //- delete btn
            q-btn(round flat dense color="grey-4" icon="delete_outline" @click="fragment = f, $refs.fragmentDeleteMenu.show()").q-mr-xs
          //- body
          div(
            :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.q-pl-xs
            div(
              v-if="(pi+1) % 2 !== 0" v-for="(p, pi) in f.relativePoints" :key="p.x"
              @click="fragment = f, point = pi, $refs.pointEditMenu.show()"
              :style=`{position: 'relative'}`
              ).col-4.q-pr-xs.cursor-pointer
              div(:style=`{position: 'absolute', bottom: '4px', left: '4px'}`).row.q-pa-xs.bg-red
                small.text-white i: {{ pi+1 }}
              //- point preivew...
              img(
                :src="f.thumbUrl[pi]"
                :style=`{width: '100%', objectFit: 'contain', borderRadius: '10px', overflow: 'hidden'}` draggable="false")
            div(v-if="f.relativePoints.length === 0").row.full-width.q-pa-sm.q-mb-xs
              q-btn(
                dense no-caps color="green" @click="fragment = f, pointAdd(0, true)"
                style=`height: 50px; borderRadius: 10px`).full-width Выделить фрагмент
          //- debug
          div(v-if="false").row.full-width.q-pa-sm
            small {{ f.relativePoints }}
</template>

<script>
import nodeFragment from './node_fragment'
import contentFinder from 'components/content_finder'

export default {
  name: 'nodeCreator__nodeFragments',
  components: {contentFinder, nodeFragment},
  props: ['colWidth', 'fragments'],
  data () {
    return {
      width: 500,
      point: undefined,
      fragment: null,
      fragmentAddHeight: 300,
      fragmentActions: [
        {id: 'edit', name: 'Edit'},
        {id: 'duplicate', name: 'Duplicate'},
        {id: 'delete', name: 'Delete', color: 'red'}
      ],
      name: '',
      nameEdit: undefined
    }
  },
  computed: {
    fragmentsLength () {
      return Object.keys(this.fragments).length
    },
    fragmentsEmpty () {
      return this.fragmentsLength === 0
    }
  },
  watch: {
    fragments: {
      immediate: true,
      handler (to, from) {
        this.$log('fragments CHANGED', to)
      }
    }
  },
  methods: {
    async contentSelected (content) {
      this.$log('contentSelected', content)
      // close content finder dialog
      this.$refs.contentFinderDialog.hide()
      await this.$wait(300)
      let WSContent = await this.$store.dispatch('workspace/addWSContent', {name: content.name, content: {oid: content.oid}})
      // open editor
      this.fragmentCreate(WSContent.content)
      // this.fragmentEdit(WSContent.content)
    },
    pointAdd (now, andOpenEditor) {
      this.$log('pointAdd')
      this.fragments[this.fragment.uid].relativePoints.push({x: now})
      this.fragments[this.fragment.uid].relativePoints.push({x: now + 10})
      if (andOpenEditor) this.$refs.videoEditorDialog.show()
    },
    pointEdit (f, pi, {id}) {
      this.$log('pointEdit', f, pi, id)
      switch (id) {
        case 'edit': {
          this.$refs.videoEditorDialog.show()
          break
        }
        case 'delete': {
          // TODO: not even indexes of fragment?
          this.$delete(this.fragments[f.uid].relativePoints, pi)
          this.$delete(this.fragments[f.uid].relativePoints, pi - 1)
          if (this.fragments[f.uid].relativePoints.length === 0) this.fragmentDelete(f.uid)
          break
        }
      }
    },
    async fragmentNameClick (f) {
      this.$log('fragmentNameClick', f)
      this.$set(this, 'name', f.name)
      this.nameEdit = f.uid
      await this.$wait(300)
      this.$nextTick(() => {
        this.$refs.nameInput[0].focus()
      })
    },
    fragmentHeaderClick () {
      this.$log('fragmentHeaderClick')
    },
    fragmentPointClick (f, pi) {
      this.$log('fragmentPointClick', f, pi)
      this.$set(this, 'fragment', f)
      this.$nextTick(() => {
        // TODO: what editor to open?
        this.$refs.videoEditorDialog.show()
      })
    },
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
      this.$log('fragmentCreate', content)
      let uid = `${content.oid}-${Date.now()}`
      let fragment = null
      switch (content.type) {
        case 'VIDEO': {
          fragment = {
            uid: uid,
            url: '',
            name: content.name,
            relativePoints: [],
            relativeScale: content.duration,
            content: content,
            thumbUrl: []
          }
          this.$set(this.fragments, uid, fragment)
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
            thumbUrl: []
          }
          this.$set(this.fragments, uid, fragment)
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

<style lang="stylus">
.kinput:focus {
  outline: none
}
</style>
