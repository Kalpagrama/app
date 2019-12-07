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
  k-dialog-bottom(ref="exitDialog" @action="exitAction" :options="{confirm: true, confirmName: 'Save', actions: {discard: {name: 'Discard changes', color: 'red'}}}")
  //- footer actions
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="fragmentEditing < 0"
      :style=`{position: 'absolute', zIndex: 5000, bottom: '0px', height: '60px'}`).row.full-width.items-center.q-px-sm
      q-btn(flat round no-caps color="grey" @click="exit()").q-mr-sm
        span {{$t('Exit')}}
      q-btn(flat round no-caps color="grey" @click="exit()")
        span {{$t('Start new')}}
      .col
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        q-btn(
          v-if="node.name.length > 0"
          :loading="nodeSaving"
          push no-caps color="accent" @click="nodeSave()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`).q-mr-sm
          span.text-bold {{ $t('Save') }}
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        q-btn(
          v-if="node.oid"
          :loading="nodePublishing"
          push no-caps color="green" @click="nodePublish()"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`)
          span.text-bold {{ $t('Publish') }}
  //- body
  div(ref="ncScroll").col.full-width.scroll
    div(v-if="loading").row.fit.items-center.justify-center
      q-spinner(size="50px" color="accent")
    div(v-else).row.full-width.items-start.content-start.q-pa-sm
      .row.full-width
        q-resize-observer(@resize="onResize")
        nc-fragment(:index="0" :stageInitial="1" :width="editorWidth" :fragment="nodeFragments[0]" @ready="fragmentReady" @edit="fragmentEdit")
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
              v-model="nodeName" :style=`{width: '100%'}`).kinput.text-center.text-bold
            span(
              v-else
              ).text-bold {{ nodeName ? nodeName : $t('Whats the essence?', 'Whats the essence?') }}
        div(v-if="true").row.full-width
          small.full-width oid: {{node.oid}}
          small.full-width name: {{node.name}}
          small.full-width counts: {{nodeFragments[0].count}}/{{nodeFragments[1].count}}
        nc-fragment(:index="1" :width="editorWidth" :fragment="nodeFragments[1]"
          @ready="fragmentReady" @edit="fragmentEdit")
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
      // node
      nodeOid: false,
      nodeName: '',
      nodeFragments: [{relativePoints: [], content: null, count: 100}, {relativePoints: [], content: null, count: 100}],
      nodeSpheres: [],
      nodeCategories: [],
      nodeLayout: 'PIP',
      // states
      nodePublishing: false,
      nodePublished: false,
      nodeSaved: false,
      nodeSaving: false
    }
  },
  computed: {
    node () {
      return {
        oid: this.nodeOid,
        name: this.nodeName,
        fragments: this.nodeFragments,
        spheres: this.nodeSpheres,
        categories: ['FUN'],
        layout: 'PIP'
      }
    }
  },
  watch: {
    node: {
      handler (to, from) {
        // this.$log('node CHANGED', to)
        localStorage.setItem('knode', JSON.stringify(to))
      }
    }
  },
  methods: {
    contentFound (index, content) {
      this.$log('contentFound nc', index, content)
      this.nodeFragments[index].content = content
      this.nodeFragments[index].contentOid = content.oid
    },
    fragmentReady (index) {
      this.$log('fragmentReady', index)
      this.nameEditStart()
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index)
      this.fragmentEditing = index
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
    nodeUse (val) {
      this.$log('nodeUse', val)
      this.nodeOid = val.oid
      this.nodeName = val.name
      this.nodeFragments = val.fragments
      this.nodeSpheres = val.spheres
      this.nodeCategories = val.categories
      this.nodeLayout = val.layout
    },
    async nodeSave () {
      this.$log('nodeSave start', this.node)
      this.nodeSaving = true
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(this.node)))
      this.$log('res', res)
      this.nodeUse(res)
      this.nodeSaving = false
      this.nodeSaved = true
      this.$log('nodeSave done')
    },
    async nodePublish () {
      this.$log('nodePublish start')
      this.nodePublishing = true
      let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
      this.$log('res', res)
      this.nodeUse(res)
      this.nodePublishing = false
      this.nodePublished = true
      this.$log('nodePublish done')
    },
    exit () {
      this.$log('exit')
      this.$refs.exitDialog.show()
    },
    async exitAction (action) {
      this.$log('exitAction')
      switch (action) {
        case 'discard': {
          this.refresh()
          this.$go('/app/workspace')
          break
        }
        case 'confirm': {
          await this.nodeSave()
          this.refresh()
          this.$go('/app/workspace')
          break
        }
      }
    },
    refresh () {
      this.$log('refresh')
      this.nodeUse({oid: false, name: '', fragments: [{content: null}, {content: null}], spheres: [], categories: ['FUN'], layout: 'PIP'})
      localStorage.removeItem('knode')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.loading = true
    // let nodeLocalStorage = localStorage.getItem('knode')
    // this.$log('nodeLocalStorage', nodeLocalStorage)
    // if (nodeLocalStorage) {
    //   this.nodeUse(JSON.parse(nodeLocalStorage))
    // } else {
    // }
    // await this.$wait(500)
    this.loading = false
    // setInterval(() => {
    //   this.$log('count !')
    //   // this.nodeFragments[0].count += 1
    //   // this.nodeFragments[0].content = {now: Date.now()}
    // }, 1000)
    // let nodeShare = null
    // this.$log('nodeShare', nodeShare)
    // let nodePayload = null
    // this.$log('nodePayload', nodePayload)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
