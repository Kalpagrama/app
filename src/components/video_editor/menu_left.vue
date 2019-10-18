<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.fit.bg-white
  //- create action
  q-btn(
    :style=`{position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000}`
    icon="add" round color="primary" @click="fragmentCreate()" size="lg")
  //- fragment editor dialog
  //- k-dialog(ref="fragmentDialog")
  //-   fragment-editor(v-if="fragment" :fragment="fragment" @fragment="fragmentEdited"
  //-     @delete="fragmentDelete(fragment)"
  //-     :style=`{maxWidth: '600px', maxHeight: '600px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`)
  //- header
  div(:style=`{position: 'absolute', borderRadius: '10px', overflow: 'hidden', zIndex: 200, top: '0px', height: '70px', background: 'rgba(255, 255, 255, 0.95)'}`).row.full-width.items-center.justify-between.q-px-md
    span.text-bold Фрагменты
  //- body
  div(body-scroll-lock-ignore :style=`{borderRadius: '10px 10px 0 0'}`).col.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(:style=`{height: '70px'}`).row.full-width
      div(
        v-for="(f, fkey) in fragments" :key="fkey"
        :style=`{height: '56px', borderRadius: '10px'}`).row.full-width.items-center.q-mb-md.hr.bg-grey-2
        div(:style=`{width: '56px', borderRadius: '10px', background: $randomColor(f.uid)}` @click="fragmentPreview(f, fkey)").row.full-height
        div(@click="fragmentClick(f, fkey)").col.full-height
          .row.fit.items-center.content-center.q-px-sm
            span {{ f.name }}
            .row.full-width
              small(v-for="p in f.relativePoints").text-grey-9 {{ p }}
        div(:style=`{width: '56px'}`).row.full-height.items-center.justify-center
          q-btn(round flat :icon="fragmentVisibilityIcon(f)" color="grey-8" @click="fragmentToggle(f, fkey)")
      div(:style=`{height: '70px'}`).row.full-width
</template>

<script>
import fragmentEditor from './fragment_editor'

export default {
  name: 'videoEditor__menuLeft',
  components: {fragmentEditor},
  props: ['fragments', 'fragmentsVisible', 'duration'],
  data () {
    return {
      toggling: false,
      fragment: null
    }
  },
  computed: {
    fragmentActions () {
      return [
        {id: 'fragment_delete', name: 'Удалить фрагмент', color: 'red'}
      ]
    }
  },
  methods: {
    fragmentVisibilityIcon (f) {
      return this.fragmentsVisible[f.uid] ? 'visibility' : 'visibility_off'
    },
    fragmentEdited () {
      this.$log('fragmentEdited')
    },
    fragmentPreview (f, fkey) {
      this.$log('fragmentPreview', f, fkey)
      this.$emit('preview', f)
      this.$emit('hide')
    },
    fragmentClick (f, fkey) {
      this.$log('fragmentClick', f, fkey)
      this.$set(this, 'fragment', f)
      // this.$refs.fragmentDialog.show()
    },
    fragmentToggle (f, fkey) {
      this.$log('fragmentToggle', f, fkey)
      this.$emit('toggle', f, fkey)
    },
    fragmentDialogClosed () {
      this.$log('fragmentDialogClosed')
      this.$set(this, 'fragment', null)
    },
    fragmentDelete (f) {
      this.$log('fragmentDelete', f)
      this.$emit('delete', f)
      this.$refs.fragmentDialog.hide()
    },
    fragmentCreate () {
      this.$log('fragmentCreate')
      this.$emit('create', {label: 'dick'})
    },
    fragmentAction (f, fkey, a) {
      switch (a.id) {
        case 'fragment_delete': {
          this.$log('fragmentAction', a.id)
          this.$emit('delete', f, fkey)
          break
        }
      }
    },
    fragmentEdit () {
      this.$log('fragmentEdit')
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
