<style lang="stylus">
.kinput
  border: none
  height: 100%
  padding: 10px
  &:focus
    outline: none
</style>

<template lang="pug">
div(:style=`{zIndex: 1000}`).column.fit.bg-grey-3
  //- actions
  q-btn(
    round flat icon="more_vert" @click="$refs.nodeCreatorDialog.show()"
    :style=`{position: 'absolute', zIndex: 400, top: '6px', right: '6px'}`)
  //- footer
  div(
    :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
    q-btn(flat round no-caps color="grey" icon="keyboard_arrow_left" @click="$router.back()")
    .col
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="coll === 'editor'"
        push no-caps color="accent" @click="$refs.nodePreviewDialog.show()"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`)
        span.text-bold {{ $t('Publish', 'Publish') }}
  k-dialog-bottom(ref="nodeCreatorDialog" @action="nodeComposerAction" :options="nodeComposerDialogOptions")
  //- preview
  q-dialog(ref="nodePreviewDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    k-page(@hide="$refs.nodePreviewDialog.hide()").bg-grey-3
      template(v-slot:footer)
        .row.fit.items-center.justify-between.q-px-sm
          q-btn(round flat icon="keyboard_arrow_left" @click="$refs.nodePreviewDialog.hide()")
          .col
          q-btn(
            no-caps color="accent"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`)
            span.text-bold {{ $t('Publish') }}
      node-rubick
  //- body
  .col.full-width.scroll
    k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :tabs="true" :style=`{height: height+'px'}`)
      template(v-slot:nodes)
        ws-nodes(@nodeClick="nodeClick" :nodeClickOverride="true")
      template(v-slot:editor)
        .row.full-width.items-start.content-start.q-px-sm
          .row.full-width
            q-resize-observer(@resize="onResize")
            //- debug
            div(
              v-if="false" :style=`{borderRadius: '10px', overflow: 'hidden', color: 'white'}`
              ).row.full-width.bg-green.q-px-sm.q-mb-xl
              small.full-width width/editorWidth: {{width}}/{{editorWidth}}
            nc-fragment(:stageInitial="1" :width="editorWidth").q-mb-sm
            //- name
            div(
              @click="nameEditStart()"
              :style=`{
                height: '60px', borderRadius: '10px', overflow: 'hidden',
                border: nameEditing ? '3px solid black' : '3px solid white'}`
              ).row.full-width.items-center.justify-center.bg-white.q-mb-sm
              input(
                v-if="nameEditing" ref="nameInput" @blur="nameEditing = false" type="textarea" :rows="2"
                v-model="node.name" :style=`{width: '100%'}`).kinput.text-center.text-bold
              span(
                v-else
                ).text-bold {{ node.name ? node.name : $t('Whats the point?', 'Whats the point?') }}
            nc-fragment(:width="editorWidth")
</template>

<script>
import wsNodes from 'components/workspace/ws_nodes'
import ncFragment from './nc_fragment'

export default {
  name: 'nodeComposer',
  components: {wsNodes, ncFragment},
  props: ['width', 'height'],
  data () {
    return {
      coll: 'editor',
      colls: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'editor', name: 'Node editor'}
      ],
      editorWidth: 0,
      nameEditing: false,
      node: {
        name: '',
        fragments: []
      },
      nodeComposerDialogOptions: {
        header: false,
        confirm: true,
        confirmName: 'Save node',
        actions: {
          new: {name: 'Start new one'},
          help: {name: 'Help me'}
        }
      }
    }
  },
  watch: {
    node: {
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.editorWidth = e.width
    },
    nodeClick ([n, ni]) {
      this.$logD('nodeClick', n, ni)
    },
    nameEditStart () {
      this.$logD('nameEditStart')
      this.nameEditing = true
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    },
    startNew () {
      this.$logD('startNew')
    },
    nodeComposerAction (action) {
      this.$logD('nodeComposerAction', action)
      switch (action) {
        case 'new': {
          this.startNew()
          break
        }
        case 'help': {
          this.$logD('HELP HELP HELP')
          break
        }
      }
    }
  },
  async mounted () {
    this.$logD('mounted')
    // load last one from storage
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
