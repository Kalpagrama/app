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
.column.fit.bg-grey-3
  k-dialog-bottom(ref="exitDialog" @action="$event => refreshAction($event, true)" :options="{confirm: true, confirmName: 'Save & exit', actions: {discard: {name: 'Discard changes', color: 'red'}}}")
  k-dialog-bottom(ref="refreshDialog" @action="$event => refreshAction($event, false)" :options="{confirm: true, confirmName: 'Save & start new', actions: {discard: {name: 'Discard changes', color: 'red'}}}")
  //- footer actions
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
          v-if="node && node.name.length > 0"
          :loading="nodeSaving"
          push no-caps color="accent" @click="nodeSave()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
          span.text-bold {{ $t('Save to ws') }}
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        q-btn(
          v-if="node && node.oid"
          :loading="nodePublishing"
          push no-caps color="green" @click="nodePublish()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span.text-bold {{ $t('Publish') }}
  //- body
  div(ref="ncScroll").col.full-width.scroll.kscroll
    div(v-if="loading").row.fit.items-center.justify-center
      q-spinner(size="60px" color="accent")
    div(v-else).row.full-width.items-start.content-start.q-pa-sm
      div(v-if="node").row.full-width
        q-resize-observer(@resize="onResize")
        nc-fragment(:index="0" :stageInitial="1" :width="editorWidth" :node="node" @edit="fragmentEdit")
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
              ).text-bold {{ node.name ? node.name : $t('Whats the essence?!') }}
        nc-fragment(
          v-if="node.fragments[0]"
          :index="1" :width="editorWidth" :node="node" @edit="fragmentEdit")
</template>

<script>
import ncFragment from './nc_fragment'

export default {
  name: 'nodeComposer',
  components: {ncFragment},
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
        name: '',
        fragments: [
          // {relativePoints: [], relativeScale: 0, content: null, contentOid: false},
          // {relativePoints: [], relativeScale: 0, content: null, contentOid: false}
        ],
        categories: ['FUN'],
        spheres: [],
        meta: {
          layout: 'PIP',
          fragments: [
            // {thumbUrl: '', relativeCuts: []},
            // {thumbUrl: '', relativeCuts: []}
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
    fragmentReady (index) {
      this.$log('fragmentReady', index)
      this.nameEditStart()
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.fragmentEditing = index
      if (index < 0) return
      this.$tween.to(this.$refs.ncScroll, 0.3, {scrollTop: index === 0 ? 0 : this.$refs.ncScroll.scrollHeight})
    },
    nameEditStart () {
      this.$logD('nameEditStart')
      this.nameEditing = true
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    },
    async nodeSave () {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.node = res
        this.nodeSaving = false
        this.$log('nodeSave done')
        // this.refreshAction('discard', true)
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        // this.node = res
        this.nodePublishing = false
        this.$log('nodePublish done')
        this.refreshAction('discard', true)
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
      }
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
      this.node = JSON.parse(nodeLocalStorage)
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
