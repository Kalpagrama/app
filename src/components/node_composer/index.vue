<template lang="pug">
div(:style=`{zIndex: 1000}`).column.fit.bg-grey-3
  q-btn(
    round flat icon="more_vert" @click="$refs.nodeCreatorDialog.show()"
    :style=`{position: 'absolute', zIndex: 400, top: '6px', right: '6px'}`)
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="coll === 'editor'"
      :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(flat round no-caps color="grey" icon="keyboard_arrow_left" @click="$router.back()")
        //- span {{ $t('Exit') }}
      .col
      q-btn(flat no-caps color="accent" @click="$refs.nodePreviewDialog.show()")
        span.text-bold {{ $t('Preview') }}
  //- q-dialog(ref="nodeCreatorDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
  //-   .column.fit.bg-white
  //-     div(:style=`{height: '60px'}`).row.full-width.items-center
  //-       div(:style=`{height: '60px', width: '45px'}`).row.items-center.justify-end
  //-         q-btn(round flat icon="keyboard_arrow_left" @click="$refs.nodeCreatorDialog.hide()")
  //-     .col.full-width
  k-dialog-bottom(ref="nodeCreatorDialog" @action="nodeComposerAction" :options="nodeComposerDialogOptions")
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
  div(
    v-if="false"
    :style=`{height: '40px'}`).row.full-width
    div(
      v-if="false"
      :style=`{height: '40px', width: '45px'}`).row.items-end.justify-start
      q-btn(round flat icon="keyboard_arrow_left")
    .col.full-height
      .row.fit.items-end.justify-start.q-px-md
        span.text-bold {{ $t('Node composer') }}
    div(
      v-if="true"
      :style=`{height: '40px', width: '60px'}`).row.items-end.justify-center
      q-btn(round flat icon="more_vert" @click="$refs.nodeCreatorDialog.show()")
  .col.full-width.scroll
    k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :tabs="true" :style=`{height: height+'px'}`)
      template(v-slot:nodes)
        drafts(:height="height" @new="startNew()" @draft="$router.push({params: {page: 'editor'}})")
      template(v-slot:editor)
        editor(:height="height" @preview="$refs.nodePreviewDialog.show()")
</template>

<script>
import drafts from './drafts'
import editor from './editor'

export default {
  name: 'nodeComposer',
  components: {drafts, editor},
  props: ['width', 'height'],
  data () {
    return {
      coll: 'editor',
      colls: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'editor', name: 'Node editor'}
      ],
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
  methods: {
    nameEditStart () {
      this.$logD('nameEditStart')
      this.$refs.nameFinderDialog.show()
      this.nameEditing = true
    },
    fragmentFindStart (i) {
      this.$logD('fragmentFindStart', i)
      this.fragmentFinding = i
      this.$refs.fragmentFinderDialog.show()
    },
    fragmentFinderDialogToggled (show) {
      if (show) {
        this.$tween.to(this, 0.3, {fragmentFinderDialogBackgroundOpacity: 0.25})
      } else {
        this.$tween.to(this, 0.3, {fragmentFinderDialogBackgroundOpacity: 0})
        this.fragmentFinding = -1
      }
    },
    startNew () {
      this.$logD('startNew')
      // save current to drafts
      // remove from localStorage
      // go to the editor
      // this.$router.push({params: {page: 'editor'}})
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
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
