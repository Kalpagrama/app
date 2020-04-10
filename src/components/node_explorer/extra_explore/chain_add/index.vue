<style lang="sass">
</style>

<template lang="pug">
div(:style=`{}`).column.fit.bg-grey-8
  //- composition finder
  composition-finder(
    v-show="compositionFinderDialogShow"
    :inDialog="true"
    @composition="compositionFound"
    @cancel="compositionFinderDialogToggle()"
    :style=`{
      position: 'absolute', zIndex: 3000, top: '0px', left: compositionFinderDialogRight+'%',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'
    }`).bg-grey-8
  //- composition editor
  q-dialog(v-model="compositionEditorDialogShow" maximized position="right")
    composition-editor(
      ctx="editor"
      :inDialog="true"
      :node="nodeNew" :compositionIndex="0"
      @cancel="compositionEditorDialogShow = false"
      :style=`{minWidth: $q.screen.width+'px', minHeight: $q.screen.height+'px'}`).bg-grey-10
  //- name and spheres editor
  q-dialog(v-model="namesDialogShow" maximized position="right")
    names-editor(:node="nodeNew" @cancel="namesDialogShow = false")
  //- body
  div(:style=`{paddingBottom: '0px'}`).col.full-width.scroll.q-pa-xs
    //- add preview
    div(
      :style=`{position: 'relative', height: '200px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-9.q-mb-sm
      composition(
        v-if="nodeNew.items[0]" ctx="editor"
        :value="nodeNew.items[0]"
        :visible="true" :active="true" :mini="false")
      q-btn(
        v-if="!nodeNew.items[0]"
        round outline color="green" size="lg" icon="add" @click="compositionFind(0)"
        :style=`{borderRadius: '50%'}`)
      q-btn(
        v-if="nodeNew.items[0]"
        round flat color="white" icon="edit" @click="compositionEdit(0)"
        :style=`{position: 'absolute', zIndex: 3000, right: '10px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.3)'}`)
    //- set name
    div(:style=`{minHeight: '60px'}` @click="namesDialogShow = true").row.full-width.q-pa-sm
      //- name
      div(:style=`{height: '60px'}`).row.full-width
        span(
          v-if="nodeNew.name.length > 0"
          ).text-white.text-bold {{ nodeNew.name }}
        span(
          v-else
          ).text-white.text-bold Whats on yout mind?
      //- spheres
      .row.full-width
        span.text-white.text-bold.q-mr-sm {{nodeNew.category}}
        span.text-white {{nodeNew.spheres}}
  //- footer
  div(
    :style=`{position: 'absolute', bottom: '0px', zIndex: 200, height: '60px', background: 'rgba(0,0,0,0.3)'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-sm
    q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="$emit('hide')"
      :style=`{background: 'rgba(0,0,0,0.3)'}`)
    .col
    q-btn(
      outline color="green" no-caps
      :loading="chainSaving").q-mr-sm
      span Save
    q-btn(
      push color="green" no-caps @click="chainAdd()"
      :loading="chainAdding")
      span.text-white.text-bold Publish
</template>

<script>
import namesEditor from './names_editor'

export default {
  name: 'nodeExplorer_extraExplore_chainAdd',
  components: {namesEditor},
  props: ['node'],
  data () {
    return {
      chainAdding: false,
      chainSaving: false,
      namesDialogShow: false,
      compositionIndex: 0,
      compositionEditorDialogShow: false,
      compositionFinderDialogShow: false,
      compositionFinderDialogRight: 100,
      nodeNew: {
        name: '',
        layout: 'PIP',
        category: 'FUN',
        items: [],
        spheres: []
      }
    }
  },
  watch: {
    nodeNew: {
      deep: true,
      handler (to, from) {
        this.$log('nodeNew CHANGED', to)
      }
    },
    // compositionFinderDialogShow: {
    //   handler (to, from) {
    //     this.$log('compositionFinderDialogShow')
    //     this.$tween.to(this, 0.3, {compositionFinderDialogRight: to ? 500 : 0})
    //   }
    // }
  },
  methods: {
    compositionFinderDialogToggle () {
      this.$log('compositionFinderDialogToggle')
      if (this.compositionFinderDialogShow) {
        this.$tween.to(this, 0.3, {
          compositionFinderDialogRight: 100,
          onComplete: () => {
            this.compositionFinderDialogShow = false
          }
        })
      }
      else {
        this.compositionFinderDialogShow = true
        this.$tween.to(this, 0.3, {compositionFinderDialogRight: 0})
      }
    },
    compositionFind (index) {
      this.$log('compositionFind', index)
      this.compositionIndex = index
      this.compositionFinderDialogToggle()
    },
    compositionFound (composition) {
      this.$log('compositionFound', composition)
      this.$set(this.nodeNew.items, this.compositionIndex, composition)
      this.compositionEdit(this.compositionIndex)
      this.$wait(300).then(() => {
        this.compositionFinderDialogShow = false
      })
    },
    compositionEdit (index) {
      this.$log('compositionEdit', index)
      this.compositionIndex = index
      this.compositionEditorDialogShow = true
    },
    compositionEdited () {
      let composition = this.nodeNew.items[this.compositionIndex]
      this.$log('compositionEdited', composition)
      // if we got empty composition
      if (composition.layers[0].figuresAbsolute.length === 0) {
        this.$log('composition EMPTY')
        this.$set(this.nodeNew.items, this.compositionIndex, null)
      }
      // we got good composition with layers with figuresAbsolute
      else {
        this.$log('composition EDITED')
        this.$set(this.nodeNew.items, this.compositionIndex, composition)
      }
    },
    compositionDelete (index) {
      this.$log('compositionDelete', index)
      // this.$set(this.nodeNew.items, index, null)
      this.$delete(this.nodeNew.items, index)
    },
    async chainAdd () {
      try {
        this.$log('chainAdd start')
        this.chainAdding = true
        await this.$wait(1000)
        let chain = {
          spheres: [],
          links: [
            {
              type: 'ESSENCE',
              leftOid: this.node.oid,
              // rightOid: 'AwFnz1MBQAU',
              rightNode: this.nodeNew,
              // rightNode: {
              //   name: this.nameInput,
              //   category: 'FUN',
              //   layout: 'PIP',
              //   spheres: [{name: 'some'}, {name: 'sphere'}, {name: 'here'}],
              //   items: [
              //     this.node.items[1]
              //   ]
              // }
            }
          ]
        }
        let res = await this.$store.dispatch('node/chainCreate', chain)
        this.$log('chainAdd done', res)
        this.chainAdding = false
      }
      catch (e) {
        this.$log('chainAdd error', e)
        this.chainAdding = false
      }
    },
    async chainSave () {
      try {
        this.$log('chainSave')
      }
      catch (e) {
        this.$log('chainSave error', e)
      }
    }
  }
}
</script>
