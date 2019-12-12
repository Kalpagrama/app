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
q-layout
  q-dialog(ref="ncSaveDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    nc-save(:node="node" @saved="node = $event" @published="refreshAction('discard', true)")
  //- footer actions
  q-footer
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="fragmentEditing < 0"
        :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
        q-btn(flat round no-caps color="grey" @click="$refs.exitDialog.show()").q-mr-sm
          span {{$t('Exit')}}
        q-btn(flat round no-caps color="grey" @click="$refs.refreshDialog.show()")
          span {{$t('Start new')}}
        .col
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(
            v-if="node"
            :loading="nodeSaving"
            push no-caps color="accent" @click="$refs.ncSaveDialog.show()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
            span.text-bold {{ $t('Preview') }}
  q-page-conainter
      //- q-page
      k-dialog-bottom(ref="exitDialog" @action="$event => refreshAction($event, true)" :options="{confirm: true, confirmName: 'Save & exit', actions: {discard: {name: 'Discard changes', color: 'red'}}}")
      k-dialog-bottom(ref="refreshDialog" @action="$event => refreshAction($event, false)" :options="{confirm: true, confirmName: 'Save & start new', actions: {discard: {name: 'Discard changes', color: 'red'}}}")
      //- body
      .row.full-width
        div(v-if="loading" :style=`{height: $q.screen.height+'px'}`).row.full-width.items-center.justify-center
          q-spinner(size="60px" color="primary")
        div(v-else).row.full-width.items-start.content-start.q-pa-sm
          div(v-if="node").row.full-width
            q-resize-observer(@resize="onResize")
            nc-fragment(:width="editorWidth" :thumbUrl="false" :fragment="node.fragments[0]" :inEditor="true" :stageFirst="1"
              @content="$event => fragmentCreate(0, $event)"
              @fragment="$event => fragmentSet(0, $event)")
            //- name
            div(ref="nameEditor").row.full-width.q-py-sm
              div(
                @click="nodeNameEdit()"
                :style=`{
                  height: '60px', borderRadius: '10px', overflow: 'hidden',
                  border: nameEditing ? '2px solid #789dff' : '3px solid white'}`
                ).row.full-width.items-center.justify-center.bg-white
                input(
                  v-if="nameEditing" ref="nameInput" @blur="nameEditing = false" type="textarea" :rows="2"
                  v-model="node.name" :style=`{width: '100%'}`).kinput.text-center.text-bold
                span(
                  v-else
                  ).text-bold {{ node.name ? node.name : $t('Whats the essence?!') }}
            nc-fragment(:width="editorWidth" :thumbUrl="false" :fragment="node.fragments[1]" :inEditor="true"
              @content="$event => fragmentCreate(1, $event)"
              @fragment="$event => fragmentSet(1, $event)")
</template>

<script>
import ncFragment from './nc_fragment'
import ncSave from './nc_save'

export default {
  name: 'nodeComposer',
  components: {ncFragment, ncSave},
  props: ['width', 'height'],
  data () {
    return {
      loading: true,
      editorWidth: 0,
      nameEditing: false,
      fragmentEditing: -1,
      node: null,
      nodeNew: {
        oid: false,
        layout: 'PIP',
        name: '',
        fragments: [
          // {name: '', thumbUrl: '', scale: 0, content: {oid: "", type: "VIDEO", contentType: "KALPA"}, cuts: [points: [{x: 0}]]},
        ],
        categories: ['FUN'],
        spheres: [],
        meta: {
          fragments: [
            // {thumbUrl: '', color: '', width: '', height: ''}
          ]
        }
      },
      nodePublishing: false,
      nodeSaving: false
    }
  },
  computed: {
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        localStorage.setItem('knode', JSON.stringify(to))
      }
    }
  },
  methods: {
    fragmentCreate (index, content) {
      this.$log('fragmentCreate', index, content)
      this.$set(this.node.fragments, index, {
        name: '',
        thumbUrl: '',
        scale: content.type === 'VIDEO' ? content.duration : 100,
        content: content,
        cuts: []
      })
    },
    fragmentSet (index, fragment) {
      this.$log('fragmentSet', index, fragment)
      this.$set(this.node.fragments, index, fragment)
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.fragmentEditing = index
      if (index < 0) return
      this.$tween.to(document, 0.3, {scrollTop: index === 0 ? 0 : window.scrollHeight})
    },
    nodeNameEdit () {
      this.$log('nodeNameEdit')
      this.nameEditing = true
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    },
    async refreshAction (action, exit) {
      this.$log('refreshAction', action)
      if (action === 'confirm') await this.nodeSave()
      this.refresh()
      if (exit) this.$go('/app/workspace')
    },
    refresh () {
      this.$log('refresh')
      this.$set(this, 'node', this.nodeNew)
      localStorage.removeItem('knode')
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.editorWidth = e.width
    }
  },
  async mounted () {
    this.$log('mounted')
    this.loading = true
    let nodeLocalStorage = localStorage.getItem('knode')
    // this.$log('nodeLocalStorage', nodeLocalStorage)
    if (nodeLocalStorage) {
      this.$set(this, 'node', JSON.parse(nodeLocalStorage))
      // this.node = JSON.parse(nodeLocalStorage)
    } else {
      this.refresh()
    }
    // nodeWs, nodeShare
    await this.$wait(1000)
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
