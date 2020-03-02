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
    q-dialog(v-model="compositionEditorOpened" :maximized="true" @hide="compositionOneActive = true, compositionTwoActive = true").bg-black
      composition-editor(
        ctx="editor"
        :value="node" :compositionIndex="compositionIndex"
        @composition="compositionEdited" @close="compositionEditorOpened = false").bg-black
    //- composition FINDER dialog
    q-dialog(v-model="compositionFinderOpened").bg-black
      composition-finder(
        @composition="compositionFound" @close="compositionFinderOpened = false").bg-black
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start.justify-center.q-px-sm
        //- header
        div(
          :style=`{height: '113px'}`
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
              q-btn(
                v-if="node && node.oid"
                outline color="green" no-caps :loading="nodeSaving" @click="nodeSaveImmediate()"
                :style=`{borderRadius: '10px'}`).q-mr-md
                span().text-bold.text-green Save
              //- .col.full-height
              q-btn(
                v-if="node && node.oid"
                push color="green" no-caps :loading="nodePublishing" @click="nodePublish()"
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
        div(:style=`{height: '400px'}`).row.full-width
          //- span hello
          //- spheres(:node="node")
          //- div(
          //-   v-if="node && node.name.length > 0"
          //-   :style=`{minHeight: '400px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.bg-grey-10.q-my-md
          //-   div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
          //-     span.text-bold.text-green Category & spheres
          //-   .row.full-width
          //-     span(
          //-       v-if="node"
          //-       v-for="(s,si) in node.spheres" :key="si"
          //-       :class=`{}`
          //-       :style=`{borderRadius: '10px'}`
          //-     ).text-green.q-pa-sm.bg-grey-10.q-mb-sm.q-mr-sm {{ s.name }}
</template>

<script>
import { debounce } from 'quasar'
import spheres from './spheres'

export default {
  name: 'nodeEditor',
  components: {spheres},
  props: ['value'],
  data () {
    return {
      maxWidth: 600,
      nodeChanged: false, // ядро изменено пользователем(есть неотправленные во вьюикс изменения)
      nodeSaving: false,
      nodeSavingError: null,
      nodePublishing: false,
      nodePublishingError: null,
      nodeDeleting: false,
      nodeDeletingError: null,
      node: null,
      nodeNew: {
        name: '',
        revision: 0,
        layout: 'PIP',
        category: 'FUN',
        spheres: [],
        compositions: []
      },
      compositionEditorOpened: false,
      compositionFinderOpened: false,
      compositionIndex: undefined,
      compositionOneVisible: true,
      compositionOneActive: true,
      compositionTwoVisible: true,
      compositionTwoActive: true
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        if (to) {
          if (this.node.revision !== to.revision){ // ядро изменено на сервере
            if (this.nodeChanged) { // если пользователь успел изменить что-либо
              this.$log('has user changes! try to save')
              this.nodeSaveDebounce()
            } else {
              this.$log('value CHANGED1 ', to)
              this.node = JSON.parse(JSON.stringify(to))
            }
          }
        } else {
          this.$log('value CHANGED2', to)
          this.node = JSON.parse(JSON.stringify(this.nodeNew))
        }
      }
    },
    node: {
      deep: true,
      handler (to, from) {
        if (to) {
          if (!from || from.revision === to.revision) { // ядро изменено пользователем
            this.$log('node CHANGED:', to.revision, to.name)
            this.nodeChanged = true
            this.nodeSaveDebounce()
          }
        }
      }
    }
  },
  methods: {
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
      if (composition.layers.length === 0 && composition.layers[0].figuresAbsolute.length === 0) {
        this.$log('cEMPTY')
        this.$set(this.node.compositions, this.compositionIndex, null)
      }
      // we got good composition
      else {
        this.$log('cEDITED')
        this.$set(this.node.compositions, this.compositionIndex, composition)
        // this.compositionOneActive = true
        // this.compositionTwoActive = true
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
        await this.$wait(1000)
        let res = await this.$store.dispatch('workspace/wsItemDelete', oid)
        this.$log('nodeDelete done')
        this.nodeDeleting = false
        this.nodeDeletingError = null
        // TODO delete node and exit
        await this.$router.replace('/workspace/nodes')
        this.node = this.nodeNew
      } catch (e) {
        this.$log('nodeDelete error', e)
        this.nodeDeleting = false
        this.nodeDeletingError = e
      }
    },
    async nodeSaveImmediate () {
      try {
        if (!this.nodeChanged) return
        this.$log('nodeSave start', this.node.revision, this.node.name)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', this.node)
        // await this.$wait(600)
        this.$log('nodeSave res', res.revision, res.name, res)
        this.$log('nodeSave this.value', this.value)
        if (!this.value) {
          this.$log('nodeSave SET WS ITEM')
          if (!this.$route.params.oid) this.$router.push('/workspace/nodes/' + res.oid).catch(e => e)
          this.$store.commit('workspace/stateSet', ['itemType', 'node'])
          this.$store.commit('workspace/stateSet', ['item', res])
        }
        this.$log('nodeSave done', res.revision, res.name)
        this.nodeSavingError = null
      } catch (e) {
        this.$logE('nodeSave error', e)
        this.nodeSavingError = e
      } finally {
        this.nodeSaving = false
        this.nodeChanged = false
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        // TODO need prePublish check
        this.nodePublishing = true
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        await this.$wait(600)
        this.$log('res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        this.nodePublishingError = null
        this.$log('nodePublish done')
        this.nodePublishing = false
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishingError = e
        this.nodePublishing = false
      }
    }
  },
  created () {
    this.nodeSaveDebounce = debounce(this.nodeSaveImmediate, 1000)
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
