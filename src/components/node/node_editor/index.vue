<style lang="sass">
.kinput
  border: none
  height: 100%
  padding: 10px
  &:focus
    outline: none
.q-header
  background: none
.q-footer
  background: none
.q-btn
  border-radius: 10px
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`)
  q-dialog(
    v-model="compositionEditorOpened" no-route-dismiss :maximized="true"
    @hide="compositionEdited").bg-grey-10
    composition-editor(
      ctx="editor"
      :inDialog="true"
      :node="node" :compositionIndex="compositionIndex"
      @cancel="compositionEditorOpened = false").bg-grey-10
  q-dialog(
    v-model="compositionFinderOpened" no-route-dismiss :maximized="true"
    ).bg-grey-10
    composition-finder(
      :inDialog="true"
      @composition="compositionFound"
      @cancel="compositionFinderOpened = false").bg-grey-10
  q-header(reveal)
    div(
      :style=`{height: '60px', background: 'rgba(33,33,33, 0.8)'}`
      ).row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit.items-center.content-center
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('cancel')")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span.text-bold.text-white Node editor
        div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="more_vert")
  q-footer(
    v-if="!nodeNameInputFocused"
    reveal)
    div(
      :style=`{height: '60px'}`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0'}`).row.full-width.items-center.content-center.bg-grey-8.q-px-sm
        q-btn(
          v-if="node && node.oid"
          flat color="red" icon="delete_outline" @click="nodeDelete(node.oid)"
          :style=`{borderRadius: '10px', width: '36px'}`).q-mr-sm
        .col
        q-btn(
          v-if="node && node.oid"
          no-caps push color="green"
          :loading="nodePublishing"
          :style=`{borderRadius: '10px', minWidth: '100px'}` @click="nodePublish()")
          span.text-white.text-bold Publish
  q-page-container.fit
    q-page.fit
        //- q-scroll-area.fit
        .row.full-width.items-start.content-start.justify-center
          div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
            //- composition one
            div(
              :style=`{position: 'relative', zIndex: 200, minHeight: '300px', borderRadius: '10px', overflow: 'hidden'}`
              ).row.full-width.bg-grey-9
              composition(
                v-if="node.compositions[0]" ctx="editor"
                :value="node.compositions[0]"
                :visible="compositionOneVisible"
                :active="compositionOneActive"
                :mini="false")
              //- composition actions
              div(
                v-if="!node.compositions[0]"
                :style=`{position: 'absolute', zIndex: 3000}`
                ).row.fit.items-center.content-center.justify-center
                q-btn(v-if="!node.compositions[0]" round flat color="green" icon="add" size="lg" @click="compositionFind(0)")
              q-btn(v-if="node.compositions[0]" round flat color="white" icon="edit" @click="compositionEdit(0)"
                  :style=`{position: 'absolute', zIndex: 3000, left: '16px', top: '40%', background: 'rgba(0,0,0,0.3)'}`)
              q-btn(v-if="node.compositions[0]" round flat color="red" icon='clear' @click="compositionDelete(0)"
                  :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '16px', background: 'rgba(0,0,0,0.3)'}`)
            //- essence editor
            div(v-if="node").row.full-width.q-my-sm
              div(:style=`{borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`).row.full-width
                q-input(
                  v-if="node"
                  v-model="node.name"
                  filled  count color="green" dark
                  autogrow counter :maxlength="250"
                  @focus="nodeNameInputFocused = true" @blur="nodeNameInputFocused = false"
                  :input-style=`{minHeight: '100px'}`
                  :style=`{padding: '0px', margin: '0px', whiteSpace: 'pre-wrap'}`
                  placeholder="Whats the essence?").fit.text-bold.bg-grey-8
              div(v-if="node").row.full-width.justify-end.q-px-sm
                small.text-grey-3 {{node.name.length}}/250
            .row.full-width.q-py-sm
              q-btn(flat color="green" no-caps)
                span(:style=`{fontSize: '18px'}`).text-green.text-bold #Choose category
            node-spheres-editor(
              v-if="node && node.oid" mode="edit"
              :node="node" :style=`{maxWidth: $store.state.ui.maxWidhPage+'px', paddingBottom: '300px'}`)
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {},
  props: ['node', 'nodeNew', 'saving'],
  data () {
    return {
      maxWidth: 600,
      nodeSaving: false,
      nodeSavingError: null,
      nodePublishing: false,
      nodePublishingError: null,
      nodeDeleting: false,
      nodeDeletingError: null,
      compositionEditorOpened: false,
      compositionFinderOpened: false,
      compositionIndex: undefined,
      compositionOneVisible: true,
      compositionOneActive: true,
      compositionTwoVisible: true,
      compositionTwoActive: true,
      nodeNameInputFocused: false
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories
    }
  },
  watch: {
    // '$store.state.events.progressCreateNode': {
    //   handler (to, from) {
    //     this.$log('progressCreateNode CHANGED', to)
    //     if (to && to.progress === 100 && to.action === 'CREATE_NODE' && to.oid) {
    //       this.$router.push('/account').catch(e => e)
    //     }
    //   }
    // }
  },
  methods: {
    categoryHuman (type) {
      return this.categories.find(i => i.type === type).name
    },
    categorySet (c, ci) {
      this.$log('categorySet', c, ci)
      this.node.category = c.type
    },
    compositionFind (index) {
      this.$log('compositionFind', index)
      this.compositionIndex = index
      this.compositionOneActive = false
      this.compositionTwoActive = false
      this.compositionFinderOpened = true
    },
    async compositionFound (composition) {
      this.$log('compositionFound', composition)
      this.$set(this.node.compositions, this.compositionIndex, composition)
      this.compositionEdit(this.compositionIndex)
      this.$wait(300).then(() => {
        this.compositionFinderOpened = false
      })
    },
    compositionEdit (index) {
      this.$log('compositionEdit', index)
      this.compositionIndex = index
      this.compositionOneActive = false
      this.compositionTwoActive = false
      this.compositionEditorOpened = true
    },
    compositionEdited () {
      let composition = this.node.compositions[this.compositionIndex]
      this.$log('compositionEdited', composition)
      // if we got empty composition
      if (composition.layers[0].figuresAbsolute.length === 0) {
        this.$log('composition EMPTY')
        this.$set(this.node.compositions, this.compositionIndex, null)
      }
      // we got good composition with layers with figuresAbsolute
      else {
        this.$log('composition EDITED')
        this.$set(this.node.compositions, this.compositionIndex, composition)
      }
      this.compositionOneActive = true
      this.compositionTwoActive = true
    },
    compositionDelete (index) {
      this.$log('compositionDelete', index)
      this.compositionOneActive = false
      this.compositionTwoActive = false
      this.$set(this.node.compositions, index, null)
    },
    async nodeSave () {
      this.$log('nodeSave')
      this.nodeSaving = true
      await this.$wait(800)
      this.nodeSaving = false
      this.$emit('cancel')
    },
    async nodeDelete (oid) {
      try {
        this.$log('nodeDelete start')
        if (!oid) throw new Error('Need oid to delete node!')
        if (!confirm('Delete node?')) return
        this.nodeDeleting = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/wsItemDelete', oid)
        this.$log('nodeDelete done')
        this.nodeDeleting = false
        this.nodeDeletingError = null
        this.$emit('cancel')
      } catch (e) {
        this.$log('nodeDelete error', e)
        this.nodeDeleting = false
        this.nodeDeletingError = e
        this.$emit('cancel')
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        await this.$wait(900)
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.$log('nodePublish done')
        this.$router.push('/account').catch(e => e)
        this.nodePublishing = false
        this.nodePublishingError = null
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    }
  }
}
</script>
