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
q-layout(view="hHh lpR fFf").bg-grey-3
  //- footer actions
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-footer(v-if="fragmentEditing < 0" reveal).row.full-width.justify-center.bg-grey-3
      div(
        :style=`{height: '60px', maxWidth: '500px'}`).row.full-width.items-center.q-px-sm
        q-btn(round flat no-caps color="grey" icon="clear" @click="$router.back()").q-mr-sm
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(
            v-if="true"
            round flat no-caps color="grey" icon="refresh" @click="$refs.refreshDialog.show()")
        .col
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          q-btn(
            v-if="node && node.name.length > 0 && node.fragments[0] && node.fragments[1]"
            :loading="nodePublishing"
            push no-caps color="green" @click="nodePublish()"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`)
            span.text-bold {{ $t('Publish') }}
  q-page-conainter
    .row.full-width.justify-center
      div(:style=`{maxWidth: '500px'}`).row.full-width
        k-dialog-bottom(
          ref="refreshDialog" @action="$event => refreshAction($event, false)"
          :options=`{
            header: true, headerName: 'Start new?',
            confirm: true, confirmName: 'Save & start new',
            actions: {discard: {name: 'Discard changes', color: 'red'}}}`)
        div(v-if="loading" :style=`{height: $q.screen.height+'px'}`).row.full-width.items-center.justify-center
          q-spinner(size="60px" color="primary")
        div(v-else).row.full-width.items-start.content-start.justify-center.q-pa-sm
          div(v-if="node" :style=`{maxWidth: '500px', paddingBottom: '200px'}`).row.full-width
            nc-fragment(
              :ctx="'inEditor'"
              :index="0" :thumbUrl="false" :fragment="node.fragments[0]" :inEditor="true" :stageFirst="1"
              @edit="fragmentEdit"
              @content="$event => fragmentCreate(0, $event)"
              @fragment="$event => fragmentSet(0, $event)"
              @delete="fragmentDelete(0)")
            //- name
            div(ref="nameEditor").row.full-width.q-py-sm
              div(
                @click="nodeNameEdit()"
                :style=`{
                  height: '60px', borderRadius: '10px', overflow: 'hidden',
                  border: nameEditing ? '2px solid #52b156' : '3px solid white'}`
                ).row.full-width.items-center.justify-center.bg-white
                input(
                  v-if="nameEditing" ref="nameInput" @blur="nameEditing = false" type="textarea" :rows="2"
                  v-model="node.name" :style=`{width: '100%'}`).kinput.text-center.text-bold
                span(
                  v-else
                  ).text-bold {{ node.name ? node.name : 'В чем суть?' }}
            nc-fragment(
              ctx="inEditor"
              :index="1" :thumbUrl="false" :fragment="node.fragments[1]"
              @edit="fragmentEdit"
              @content="$event => fragmentCreate(1, $event)"
              @fragment="$event => fragmentSet(1, $event)"
              @delete="fragmentDelete(1)")
            //- sphres & categories
            div(:style=`{position: 'relative', overflow: 'hidden', borderRadius: '10px 10px 0 0'}`).row.full-width
              transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
                nc-spheres(v-if="node.name.length > 0" :node="node").q-mt-sm
            //- save / add fragment
            div(
              v-if="node.fragments[0]"
              :style=`{height: '60px', marginBottom: '200px'}`).row.full-width.q-mt-sm
              q-btn(
                outline no-caps color="green" @click="nodeSave()"
                :style=`{height: '60px', borderRadius: '10px'}`
                ).full-width
                span.text-bold {{ $t('Save to workspace') }}
</template>

<script>
import ncFragment from './nc_fragment'
import ncSpheres from './nc_spheres'

export default {
  name: 'nodeComposer',
  components: {ncFragment, ncSpheres},
  props: [],
  data () {
    return {
      loading: true,
      editorWidth: 0,
      nameEditing: false,
      fragmentEditing: -1,
      fragmentSecondShow: false,
      node: null,
      nodeNew: {
        layout: 'PIP',
        name: '',
        fragments: [],
        categories: ['FUN'],
        spheres: [],
        meta: {
          layout: 'PIP',
          fragments: []
        }
      },
      nodePublishing: false,
      nodePublishingError: null,
      nodeSaving: false,
      nodeSavingError: null
    }
  },
  computed: {
    showRefresh () {
      if (this.node && this.node.name.length > 0) {
        if (this.node.fragments[0] || this.node.fragments[1]) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
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
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      this.$delete(this.node.fragments, index)
      // this.$set(this.node.fragments, index, null)
      this.fragmentSecondShow = false
    },
    fragmentSet (index, fragment) {
      this.$log('fragmentSet', index, fragment)
      this.$set(this.node.fragments, index, fragment)
    },
    async fragmentEdit (index) {
      this.$log('fragmentEdit', index, document.body.scrollTop)
      this.fragmentEditing = index
      // if (index < 0) return
      // this.$tween.to(document.html, 0.3, {scrollTop: index === 0 ? 0 : document.html.scrollHeight})
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
      if (exit) this.$router.push('/workspace')
    },
    refresh () {
      this.$log('refresh')
      this.$set(this, 'node', this.nodeNew)
      localStorage.removeItem('knode')
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        this.$log('nodeSave done')
        this.$emit('saved', res)
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.nodePublishing = false
        this.nodePublishingError = null
        this.$log('nodePublish done')
        this.$emit('published')
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.loading = true
    let nodeLocalStorage = localStorage.getItem('knode')
    // this.$log('nodeLocalStorage', nodeLocalStorage)
    let wsItem = this.$store.state.workspace.wsItem
    this.$log('wsItem', wsItem)
    if (nodeLocalStorage) {
      if (wsItem) {
        // save whats we got
        await this.nodeSave(JSON.parse(nodeLocalStorage))
        // delete from localStorage
        localStorage.removeItem('knode')
        // set
        switch (wsItem.type) {
          case 'note': {
            this.$set(this, 'node', this.nodeNew)
            this.$set(this.node, 'name', wsItem.item.name)
            break
          }
          case 'content': {
            this.$set(this, 'node', this.nodeNew)
            this.fragmentCreate(0, JSON.parse(JSON.stringify(wsItem.item)))
            break
          }
          case 'fragment': {
            this.$set(this, 'node', this.nodeNew)
            this.fragmentSet(0, JSON.parse(JSON.stringify(wsItem.item)))
            break
          }
          case 'node': {
            this.$set(this, 'node', JSON.parse(JSON.stringify(wsItem.item)))
            break
          }
          case 'node_share': {
            // TODO:
            break
          }
          case 'fragment_share': {
            // TODO:
            break
          }
        }
      } else {
        this.$set(this, 'node', JSON.parse(nodeLocalStorage))
      }
    } else {
      this.refresh()
    }
    await this.$wait(500)
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
