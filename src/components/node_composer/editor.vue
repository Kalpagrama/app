<template lang="pug">
k-page(:noHeader="true")
  div(:style=`{position: 'relative'}`).column.fit
    q-dialog(ref="fragmentFinderDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      k-dialog-mini(@hide="$refs.fragmentFinderDialog.hide()")
        fragment-finder(@fragment="fragmentFound")
    k-dialog-bottom(ref="fragmentMenu" mode="actions" :options="fragmentMenuOptions" @action="fragmentAction")
    div(:style=`{paddingTop: '60px'}`).col.full-width.scroll
      div().row.full-width.items-start.justify-center
        div(:style=`{maxWidth: '400px'}`).row.full-width.items-start.content-start.q-pa-sm
          //- author header
          div(v-if="false" :style=`{height: '60px'}`).row.full-width.q-mb-sm
            div(v-if="showHeader" :style=`{height: '60px', borderRadius: '10px'}`).row.fit.bg-white
          //- f1
          div(
            v-if="true"
            v-ripple=`{color: 'accent'}` @click="fragmentClick(0)"
            :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.cursor-pointer.q-mb-sm
            div(v-if="fragments[0]").row.fit
              img(:src="fragments[0].thumbUrl" :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
            q-btn(v-else round flat icon="add" color="accent" size="lg" :style=`{pointerEvents: 'none'}`)
          //- name
          div(
            @click="nameClick()"
            :style=`{
              height: '60px', borderRadius: '10px', overflow: 'hidden',
              border: nameEditing ? '3px solid black' : '3px solid white'}`
            ).row.full-width.items-center.justify-center.bg-white.q-mb-sm
            input(
              v-if="nameEditing" ref="inputName" @keyup.enter="nameEditing = false" @blur="nameEditing = false"
              v-model="name" :style=`{width: '100%'}`).kinput.text-center.text-bold.br
            span(
              v-else
              ).text-bold {{ name ? name : $t('В чем суть?') }}
          //- f2
          div(
            v-ripple=`{color: 'accent'}` @click="fragmentClick(1)"
            :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.cursor-pointer.q-mb-sm
            div(v-if="fragments[1]").row.fit
              img(:src="fragments[1].thumbUrl" :style=`{objectFit: 'contain'}`).fit
            q-btn(v-else round flat icon="add" color="accent" size="lg" :style=`{pointerEvents: 'none'}`)
</template>

<script>
import fragmentFinder from './fragment_finder'

export default {
  name: 'nodeComposer__editor',
  components: {fragmentFinder},
  props: ['height'],
  data () {
    return {
      showHeader: false,
      showFooter: false,
      fragmentIndex: -1,
      fragments: [null, null],
      fragmentMenuOptions: {
        header: false,
        confirm: true,
        confirmName: 'Edit',
        actions: {
          delete: {name: 'Delete', color: 'red'}
        }
      },
      name: '',
      nameEditing: false
    }
  },
  computed: {
    showPreviewBtn () {
      if (this.fragments[0] && this.fragments[1]) return true
      else return false
    }
  },
  methods: {
    nameClick () {
      this.$logD('nameClick')
      if (this.nameEditing) {
        this.nameEditing = false
        // save name
      } else {
        this.nameEditing = true
        this.$nextTick(() => {
          this.$refs.inputName.focus()
        })
      }
    },
    fragmentClick (index) {
      this.$logD('fragmentClick', index)
      this.fragmentIndex = index
      if (this.fragments[index]) {
        this.$logD('EDIT or DELETE')
        this.$refs.fragmentMenu.show()
      } else {
        this.$refs.fragmentFinderDialog.show()
      }
    },
    fragmentFound (f) {
      this.$logD('fragmentFound', f)
      // this.fragments[this.fragmentIndex] = f
      this.$set(this.fragments, this.fragmentIndex, f)
      this.$refs.fragmentFinderDialog.hide()
      this.fragmentIndex = -1
    },
    fragmentAction (action) {
      this.$logD('fragmentAction', action)
      switch (action) {
        case 'edit': {
          this.fragmentEdit()
          break
        }
        case 'delete': {
          this.fragmentDelete()
          break
        }
      }
    },
    fragmentEdit () {
      this.$logD('fragmentEdit')
    },
    fragmentDelete () {
      this.$logD('fragmentDelete')
    },
    preview () {
      this.$logD('preview')
      this.$emit('preview')
    },
    clear () {
      this.$logD('clear')
      // start new one? save progress? or not?
      this.$set(this, 'fragments', [null, null])
      // this.fragments = [null, null]
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
