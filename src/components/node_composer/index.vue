<style lang="stylus">
.kinput
  border none
  height 100%
  padding 10px
  &:focus
    outline none
</style>
<template lang="pug">
.column.fit.bg-grey-3
  k-dialog-bottom(ref="cancelDialog" @action="cancelAction" :options="{confirm: true, confirmName: 'Save', actions: {discard: {name: 'Discard', color: 'red'}}}")
  //- footer actions
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="fragmentEditing < 0"
      :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(flat round no-caps color="grey" @click="cancel()")
        span {{$t('Back')}}
      .col
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        q-btn(
          v-if="node.name.length > 0"
          :loading="nodeSaved ? nodePublishing : nodeSaving"
          push no-caps color="accent" @click="nodeSaved ? publish() : save()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span.text-bold {{ nodeSaved ? $t('Publish') : $t('Save') }}
  //- body
  div(ref="ncScroll").col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      .row.full-width
        q-resize-observer(@resize="onResize")
        nc-fragment(:index="0" :stageInitial="1" :width="editorWidth" @ready="fragmentReady" @edit="fragmentEdit")
        //- name
        div(ref="nameEditor").row.full-width.q-py-sm
          div(
            @click="nameEditStart()"
            :style=`{
              height: '60px', borderRadius: '10px', overflow: 'hidden',
              border: nameEditing ? '2px solid #789dff' : '3px solid white'}`
            ).row.full-width.items-center.justify-center.bg-white
            input(
              v-if="nameEditing" ref="nameInput" @blur="nameEditing = false" type="textarea" :rows="2"
              v-model="node.name" :style=`{width: '100%'}`).kinput.text-center.text-bold
            span(
              v-else
              ).text-bold {{ node.name ? node.name : $t('Whats the essence?', 'Whats the essence?') }}
        nc-fragment(:index="1" :width="editorWidth" @ready="fragmentReady" @edit="fragmentEdit")
</template>

<script>
import ncFragment from './nc_fragment'

export default {
  name: 'nodeComposer',
  components: {ncFragment},
  props: ['width', 'height'],
  data () {
    return {
      coll: 'editor',
      colls: [
        {id: 'nodes', name: 'Мастерская'},
        {id: 'editor', name: 'Node editor'}
      ],
      collsTabs: true,
      editorWidth: 0,
      nameEditing: false,
      fragmentEditing: -1,
      node: {
        name: '',
        spheres: [],
        categories: ['FUN'],
        fragments: [],
        layout: 'PIP'
      },
      nodePublishing: false,
      nodePublished: false,
      nodeSaved: false,
      nodeSaving: false
    }
  },
  watch: {
    node: {
      handler (to, from) {
        this.$log('node CHANGED', to)
        // save to localstorage
        // when hit the refresh button, or cancel
      }
    }
  },
  methods: {
    fragmentReady (index) {
      this.$log('fragmentReady', index)
      this.nameEditStart()
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.fragmentEditing = index
      this.collsTabs = index < 0 ? true : false
      this.$tween.to(this.$refs.ncScroll, 0.3, {scrollTop: index === 0 ? 0 : this.$refs.ncScroll.scrollHeight})
    },
    onResize (e) {
      // this.$log('onResize', e)
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
    async save () {
      this.$log('save start', this.node)
      this.nodeSaving = true
      // await this.$wait(1000)
      let res = await this.$store.dispatch('workspace/wsNodeCreate', this.node)
      this.$log('res', res)
      this.nodeSaving = false
      this.nodeSaved = true
      this.$log('save done')
    },
    async publish () {
      this.$log('publish start')
      this.nodePublishing = true
      await this.$wait(1000)
      this.nodePublishing = false
      this.nodePublished = true
      this.$log('publish done')
    },
    cancel () {
      this.$log('cancel')
      // ask to delete or to save progress
      this.$refs.cancelDialog.show()
    },
    cancelAction (action) {
      this.$log('cancelAction')
      switch (action) {
        case 'discard': {
          // just refresh
          break
        }
        case 'confirm': {
          // save to ws, update or create?
          // then refresh
          break
        }
      }
    },
    refresh () {
      this.$log('refresh')
      this.node = {oid: undefined, name: '', fragments: [], layout: '', categories: [], spheres: []}
    }
  },
  mounted () {
    this.$log('mounted')
    // if we got something to come or not
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
