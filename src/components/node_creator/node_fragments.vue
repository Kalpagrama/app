<template lang="pug">
div(:style=`{paddingBottom: '60px'}`).row.full-width.items-start.content-start.justify-center.q-pt-sm.q-px-sm
  //- fragment finder dialog
  q-dialog(ref="fragmentFinderDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    fragment-finder(@fragment="fragmentFound" @hide="$refs.fragmentFinderDialog.hide()")
  //- video editor dialog
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(
      v-if="fragment" :value="fragment" :inCreator="true"
      @fragment="fragments[fragment.uid] = $event, $refs.videoEditorDialog.hide(), fragment = null" @hide="$refs.videoEditorDialog.hide()")
  //- fragment actions
  k-dialog-bottom(ref="fragmentActionDialog" mode="actions" :options="fragmentActionOptions" @action="fragmentAction")
  //- add fragment btn
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="tab === 'fragments'"
      push round color="green" icon="add" size="lg" @click="$refs.fragmentFinderDialog.show()"
      :style=`{position: 'fixed', zIndex: 1000, bottom: '8px', right: '8px'}`)
  //- fragment
  div(
    v-for="(f, fkey, fi) in fragments" :key="fkey" @click="fragment = f, $refs.fragmentActionDialog.show()"
    :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-sm
    //- header
    div(:style=`{height: '50px'}`).row.full-width.items-center.q-pa-sm.bg-white
      span.text-bold.q-mr-sm {{ fi+ 1 }}.
      span().text-bold {{ f.name || 'Enter fragment name' }}
    //- body maybe
    .row.full-width.q-pa-sm
      img(
        v-for="(c, ci) in f.relativeCuts" :key="ci"
        :src="c.thumbUrl"
        :style=`{borderRadius: '10px', height: '40px'}`).q-mr-xs
</template>

<script>
import fragmentFinder from 'components/fragment_finder'

export default {
  name: 'nodeCreator__nodeFragments',
  components: {fragmentFinder},
  props: ['tab', 'fragments'],
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
    },
    fragmentActionOptions () {
      return {
        header: false,
        confirm: true,
        confirmName: 'Редактировать',
        actions: {
          rename: {name: 'Переименовать'},
          duplicate: {name: 'Дублировать'},
          delete: {name: 'Удалить', color: 'red'}
        }
      }
    }
  },
  watch: {
  },
  methods: {
    fragmentAction (e) {
      this.$log('fragmentAction', e)
      switch (e) {
        case 'rename': {
          this.$log('RENAME')
          // TODO: rename from content name
          break
        }
        case 'duplicate': {
          this.$log('DUPLICATE')
          // TODO: duplicate implementation
          break
        }
        case 'delete': {
          this.$log('DELETE')
          this.$delete(this.fragments, this.fragment.uid)
          break
        }
        case 'confirm': {
          this.$log('CONFIRM')
          switch (this.fragment.content.type) {
            case 'VIDEO': {
              this.$refs.videoEditorDialog.show()
              break
            }
          }
          break
        }
      }
    },
    async fragmentFound (f) {
      this.$log('fragmentFound', f)
      // create WSContent?
      // let WSContent = await this.$store.dispatch('workspace/addWSContent', {name: content.name, content: {oid: content.oid}})
      // create WSFragment?
      this.$set(this.fragments, f.uid, f)
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
    fragmentEdit () {
      this.$log('fragmentEdit', this.fragment)
      switch (this.fragment.content.type) {
        case 'VIDEO': {
          this.$refs.videoEditorDialog.show()
        }
      }
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
