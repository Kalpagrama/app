<template lang="pug">
q-layout(view="hHh lpR fFf").bg-white
  //- header
  q-header(reveal v-if="nodeSavePossible").row.full-width.justify-center.bg-white
    div(:style=`{height: '60px', maxWidth: $store.state.ui.pageMaxWidth+'px', borderBottom: '1px solid #eee'}`
      ).row.full-width.items-center.justify-between.q-px-sm.bg-white
      transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="true"
          flat round no-caps color="red" icon="refresh" :loading="nodePurging" @click="nodePurge()")
      .col
      transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="nodeSavePossible"
          flat no-caps color="green" :disable="!nodeSavePossible" :loading="nodeSaving" @click="nodeSave()").q-mr-sm
          span.text-bold Save
      transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="nodeSavePossible"
          push no-caps color="green" :disable="!nodePublishPossible" :loading="nodePublishing" @click="nodePublish()")
          span.text-bold Publish
  //- footer
  q-footer(reveal).row.full-width.justify-center.bg-white
    .row.full-width.justify-center
      k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', background: 'white'}`)
  //- body
  q-page-container.row.full-width.justify-center.items-start.content-start
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="node"
        :style=`{
          position: 'relative',
          minHeight: $q.screen.height-170+'px',
          maxWidth: $store.state.ui.pageMaxWidth+'px'}`
        ).row.full-width.items-start.content-start.bg-white
        div(
          v-if="false"
          :style=`{height: '40px'}`).row.full-width.items-center.q-px-sm
          small(@click="refresh()").bg-red.text-white.cursor-pointer.q-mx-sm refresh
          .col
          small.bg-red-2 OID: {{ node.oid }}, version: {{nodeVersion}}
        .row.full-width.bg-white.q-pa-sm
          fragment-editor(v-if="node.fragments[0]" ref="fragmentEditorFirst" :index="0" :fragment="node.fragments[0]" @delete="fragmentDelete")
          fragment-finder(v-else @fragment="$event => fragmentFound(0, $event)")
        .row.full-width.justify-center
          textarea(
            v-model="node.name" ref="nodeNameInput" autofocus
            placeholder="В чем суть?" rows="1" @input="nameChanged"
            :style=`{fontSize: '30px', paddingLeft: '20px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', maxHeight: '150px'}`
            ).full-width.kinput.text-bold.text-black
        div(v-if="node.fragments[0]").row.full-width.bg-white.q-pa-sm
          fragment-editor(v-if="node.fragments[1]" ref="fragmentEditorSecond" :index="1" :fragment="node.fragments[1]" @delete="fragmentDelete")
          fragment-finder(v-else @fragment="$event => fragmentFound(1, $event)")
        transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-editor-spheres(
            v-if="node && nodeSavePossible" :node="node"
            :style=`{marginBottom: '70px'}`)
    //- no node
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="!node"
        :style=`{minHeight: $q.screen.height-170+'px'}`).row.full-width.items-center.content-center.justify-center
        q-spinner(size="50px" color="green")
</template>

<script>
import fragmentFinder from 'components/node/fragment_finder'
import fragmentEditor from 'components/node/fragment_editor'
import nodeEditorSpheres from './spheres'

export default {
  name: 'nodeEditor',
  components: {fragmentFinder, fragmentEditor, nodeEditorSpheres},
  data () {
    return {
      menuShow: false,
      node: null,
      nodeNew: {
        name: '',
        layout: 'PIP',
        fragments: [],
        spheres: [],
        categories: ['FUN']
      },
      nodeVersion: 0,
      nodeSpheresHeight: 50,
      nodeSaving: false,
      nodeSavingError: null,
      nodePurging: false,
      nodePublishing: false,
      nodePublishingError: null
    }
  },
  computed: {
    nodeSavePossible () {
      if (this.node &&
        this.node.name.length > 3) {
          return true
        } else {
          return false
        }
    },
    nodePublishPossible () {
      if (this.node &&
        this.node.fragments[0] !== null &&
        this.node.fragments[1] !== null &&
        this.node.fragments.length === 2) {
          return true
        } else {
          return false
        }
    }
  },
  watch: {
    node: {
      deep: true,
      immediate: false,
      handler (to, from) {
        // this.$log('node CHANGED', to)
        localStorage.setItem('knode', JSON.stringify(to))
        this.nodeVersion += 1
      }
    }
  },
  methods: {
    nameChanged (e) {
      // this.$log('nameChanged', e)
      e.target.style.height = e.target.scrollHeight + 'px'
    },
    async fragmentClick (i) {
      this.$log('fragmentClick', i)
      this.$refs.fragmentEditor.fragmentUse(i.item)
      await this.$wait(200)
      this.menuShow = false
    },
    fragmentFound (index, fragment) {
      this.$log('fragmentFound', index, fragment)
      this.$set(this.node.fragments, index, JSON.parse(JSON.stringify(fragment)))
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      this.$set(this.node.fragments, index, null)
    },
    menuToggle () {
      this.$log('menuToggle')
      this.menuShow = !this.menuShow
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        this.node = res
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    },
    async nodePublishCheck () {
      this.$log('nodePublishCheck')
      let duration = this.node.fragments.reduce((acc, f) => {
        f.cuts.map(c => {
          acc += c.points[1].x - c.points[0].x
        })
        return acc
      }, 0)
      this.$log('duration', duration)
      if (duration > 120) {
        this.$q.notify({message: 'Too big fragments!', color: 'red', textColor: 'white'})
        throw new Error('Too big fragments')
      }
      if (this.node.fragments.length !== 2) {
        this.$q.notify({message: 'Need TWO fragment to Publis node', color: 'red', textColor: 'white'})
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        this.nodePublishCheck()
        await this.nodeSave()
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        this.nodePublishingError = null
        this.nodeStart()
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    },
    async nodePurge () {
      this.$log('nodePurge')
      this.nodePurging = true
      await this.$wait(600)
      let confirmed = confirm('Delete node?')
      if (confirmed) this.nodeStart()
      localStorage.removeItem('knode')
      this.nodePurging = false
    },
    nodeStart () {
      this.$log('nodeStart')
      this.node = JSON.parse(JSON.stringify(this.nodeNew))
      this.nodeVersion = 0
      this.nodeSpheresHeight = 50
      this.nodeSaving = false
      this.nodeSavingError = null
      this.nodePublishing = false
      this.nodePublishingError = null
      this.$nextTick(() => {
        if (this.$refs.nodeNameInput) this.$refs.nodeNameInput.focus()
      })
    },
    refresh () {
      this.$log('refresh')
      localStorage.removeItem('knode')
      window.location.reload(true)
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.$q.notify('MOUNTED')
    this.$q.addressbarColor.set('white')
    document.body.style.background = 'white'
    this.nodeStart()
    // lsItem
    let lsItem = JSON.parse(localStorage.getItem('knode'))
    this.$log('lsItem', lsItem)
    // wsItem
    let wsItem = JSON.parse(JSON.stringify(this.$store.state.workspace.wsItem))
    this.$log('wsItem', wsItem)
    // checks
    if (wsItem) {
      switch (wsItem.type) {
        case 'content': {
          this.fragmentFound(0, {
            name: '',
            cuts: [],
            content: wsItem.item,
            scale: wsItem.item.duration
          })
          break
        }
        case 'fragment': {
          this.fragmentFound(0, wsItem.item)
          break
        }
        case 'cut': {
          this.fragmentFound(0, wsItem.item)
          break
        }
        case 'node': {
          this.$set(this, 'node', wsItem.item)
          break
        }
      }
      this.$store.commit('workspace/stateSet', ['wsItem', null])
    } else {
      if (lsItem) {
        this.$set(this, 'node', lsItem)
      }
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  },
  async beforeRouteLeave (to, from, next) {
    this.$log('beforeRouteLeave')
    if (this.nodeSavePossible && this.nodeVersion > 1) {
      let confirmed = confirm('Save node to WS?!')
      if (confirmed) {
        await this.nodeSave()
      } else {
        localStorage.removeItem('knode')
      }
      next()
    } else {
      next()
    }
  }
}
</script>
