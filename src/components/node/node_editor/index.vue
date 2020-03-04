<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.row.fit.justify-center
  //- column
  div(
    :style=`{position: 'relative'}`
    ).column.fit
    //- composition EDITOR dialog
    q-dialog(v-model="compositionEditorOpened" :maximized="true" no-route-dismiss @hide="compositionOneActive = true, compositionTwoActive = true").bg-black
      composition-editor(
        ctx="editor"
        :inDialog="true"
        :node="node" :compositionIndex="compositionIndex"
        @composition="compositionEdited" @close="compositionEditorOpened = false").bg-black
    //- composition FINDER dialog
    q-dialog(v-model="compositionFinderOpened" no-route-dismiss).bg-black
      composition-finder(
        :inDialog="true"
        @composition="compositionFound" @close="compositionFinderOpened = false").bg-black
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.justify-center.q-px-sm
        //- header
        div(
          :style=`{height: '120px'}`
          ).row.full-width.items-start.content-start.justify-center.q-px-sm
          div(:style=`{maxWidth: maxWidth+'px'}`).row.full-width.items-start.content-start
            //- header
            div(
              :style=`{height: '60px'}`
              ).row.full-width.items-center
            //- header actions
            div(
              :style=`{height: '53px'}`
              ).row.full-width.items-center.content-center.q-px-sm
              q-btn(
                v-if="node && node.oid"
                outline color="red" no-caps :loading="nodeDeleting" @click="nodeDelete(node.oid)"
                :style=`{borderRadius: '10px'}`)
                span Delete
              .col
              //- q-btn(
              //-   v-if="node && node.oid"
              //-   outline color="green" no-caps :loading="saving" @click="nodeSaveImmediate()"
              //-   :style=`{borderRadius: '10px'}`).q-mr-md
              //-   span().text-bold.text-green Save
              //- .col.full-height
              q-btn(
                v-if="node && node.oid"
                push color="green" no-caps :loading="saving || nodePublishing" @click="nodePublish()"
                :style=`{borderRadius: '10px'}`)
                span().text-bold Publish
        div(:style=`{maxWidth: maxWidth+'px'}`).row.full-width
          //- composition one
          div(
            :style=`{position: 'relative', minHeight: '330px', borderRadius: '10px', overflow: 'hidden'}`
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
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '40%', background: 'rgba(0,0,0,0.3)'}`)
            q-btn(v-if="node.compositions[0]" round flat color="red" icon='clear' @click="compositionDelete(0)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '16px', background: 'rgba(0,0,0,0.3)'}`)
          //- essence editor
          div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-my-md
            input(
              v-if="node"
              v-model="node.name"
              placeholder="Whats the essence?").fit.bg-white.kinput
          //- composition two
          div(
            :style=`{position: 'relative', minHeight: '330px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-grey-9
            composition(
              v-if="node.compositions[1]" ctx="editor"
              :value="node.compositions[1]"
              :visible="compositionTwoVisible"
              :active="compositionTwoActive"
              :mini="false" )
            //- composition actions
            div(
              v-if="!node.compositions[1]"
              :style=`{position: 'absolute', zIndex: 3000}`
              ).row.fit.items-center.content-center.justify-center
              q-btn(v-if="!node.compositions[1]" round flat color="green" icon="add" size="lg" @click="compositionFind(1)")
            q-btn(v-if="node.compositions[1]" round flat color="white" icon="edit" @click="compositionEdit(1)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '40%', background: 'rgba(0,0,0,0.3)'}`)
            q-btn(v-if="node.compositions[1]" round flat color="red" icon='clear' @click="compositionDelete(1)"
                :style=`{position: 'absolute', zIndex: 3000, right: '16px', top: '16px', background: 'rgba(0,0,0,0.3)'}`)
          //- debug
          div(
            v-if="$store.state.ui.debug"
            :style=`{color: 'white', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-green.q-pa-sm.q-my-sm
            small.full-width revision: {{ node.revision }}
            small.full-width oid: {{ node.oid }}
            small.full-width compositionActive: {{compositionActive}}
            small.full-width compositionVisible: {{compositionVisible}}
        div(:style=`{minHeight: '400px'}`).row.full-width.items-start.content-start.justify-center.q-py-md
          div(
            v-if="node && node.oid"
            :style=`{height: '60px', maxWidth: maxWidth+'px'}`).row.full-width.items-center.content-center.scroll
            .row.no-wrap
              span(
                v-for="(c, ci) in categories" :key="ci" @click="categorySet(c, ci)"
                v-if="c.type !== 'ALL'"
                :class=`{
                  'bg-green': c.type === node.category,
                  'text-bold': c.type === node.category
                }`
                :style=`{
                  color: 'white', whiteSpace: 'nowrap', textTransform: 'capitalize',
                  borderRadius: '10px', overflow: 'hidden'}`
                ).cursor-pointer.q-pa-sm.q-mr-sm {{ c.sphere.name }}
          node-spheres-editor(
            v-if="node && node.oid" mode="edit"
            :node="node" :style=`{maxWidth: maxWidth+'px'}`)
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {},
  props: ['node', 'saving'],
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
      compositionTwoActive: true
    }
  },
  computed: {
    categories () {
      return this.$store.state.node.categories
    }
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
    async compositionFound (c) {
      this.$log('compositionFound', c)
      // TODO add second content to composition...
      this.$set(this.node.compositions, this.compositionIndex, c)
      this.compositionEdit(this.compositionIndex)
      await this.$wait(300)
      this.compositionFinderOpened = false
    },
    compositionEdit (index) {
      this.$log('compositionEdit', index)
      this.compositionIndex = index
      this.compositionOneActive = false
      this.compositionTwoActive = false
      this.compositionEditorOpened = true
    },
    compositionEdited (composition) {
      this.$log('compositionEdited', composition)
      // if we got empty composition
      if (composition.layers[0].figuresAbsolute.length === 0) {
        this.$log('cEMPTY')
        this.$set(this.node.compositions, this.compositionIndex, null)
      }
      // we got good composition
      else {
        this.$log('cEDITED')
        this.$set(this.node.compositions, this.compositionIndex, composition)
      }
    },
    compositionDelete (index) {
      this.$log('compositionDelete', index)
      this.compositionOneActive = false
      this.compositionTwoActive = false
      this.$set(this.node.compositions, index, null)
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
        // TODO delete node and exit
        await this.$router.replace('/workspace/node')
        // this.node = this.nodeNew
      } catch (e) {
        this.$log('nodeDelete error', e)
        this.nodeDeleting = false
        this.nodeDeletingError = e
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.$log('nodePublish done')
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
