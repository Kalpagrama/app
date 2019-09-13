<template lang="pug">
div(:style=`{overflowX: 'auto'}`).row.full-height
  //- content find dialog
  q-dialog(ref="contentFinderDialog" position="bottom")
    content-finder(@content="fragmentAdd($event), $refs.contentFinderDialog.hide()")
  //- editors
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(v-if="videoEditorShow && fragments[fragmentEditing]" :fragment="fragments[fragmentEditing]" @fragment="fragmentSync" @ready="fragmentEdited" @close="videoEditorShow = false, $refs.videoEditorDialog.hide()")
  //- node editor dialog
  q-dialog(ref="nodeEditorDialog" position="bottom")
    node-editor(:node="node" @node="node = $event" @close="$refs.nodeEditorDialog.hide()" :style=`{maxWidth: '500px'}`)
  //- wrapper
  div.row.full-height.no-wrap
    div(:style=`{width: '76px'}`).row.full-height.gt-sm
    //- fragments from workspace
    div(v-if="false" v-show="fragmentsWorkspaceShow" :style=`{width: colWidth+'px', maxWidth: colWidth+'px', display: 'block'}`).full-height
      nodes-workspace(@nodeClick="nodeWorkspaceClick")
    //- fragment selected
    div(:style=`{width: colWidth+'px', maxWidth: colWidth+'px', display: 'block'}`).full-height.q-px-sm
      .column.full-height
        //- header
        div(v-if="false" :style=`{height: '66px', borderRadius: '30px'}`).row.full-width.items-center.q-pr-md.bg-white
          div(:style=`{width: '66px', height: '66px'}`).row
          q-btn(v-show="!fragmentsWorkspaceShow" icon="keyboard_arrow_left" round flat color="grey-6" @click="fragmentsWorkspaceShow = true")
          span.text-grey-8 Фрагменты
          .col
          //- q-btn(round flat color="grey-6" icon="search")
          q-btn(round flat color="grey-6" icon="more_vert")
        //- body
        .col.scroll
          .row.full-width.items-start.q-pt-sm
          //- fragments list
          div(
            v-for="(f, fi) in fragments" :key="fi"
            :style=`{position: 'relative', minHeight: '150px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.bg-white.q-mb-md.shadow-1
            //- fragment actions top right
            div(:style=`{position: 'absolute', zIndex: 100, top: '8px', right: '8px', height: '40px', opacity: 0.3}`).row
              q-btn(round flat dense color="white" icon="edit" @click="fragmentEdit(f, fi)").bg-grey-9
            //- fragment actions top left
            div(:style=`{position: 'absolute', zIndex: 100, top: '8px', left: '8px', height: '40px', opacity: 0.3}`).row
              q-btn(round flat dense color="white" icon="clear" @click="fragmentDelete(fi)").bg-grey-9
            //- fragment actions bottom left
            div(:style=`{position: 'absolute', zIndex: 100, bottom: '8px', left: '8px', height: '40px', opacity: 0.3}`).row
              q-btn(round flat dense color="white" icon="keyboard_arrow_down" @click="fragmentDuplicate(f, fi)").bg-grey-9
            //- fragment preview only?
            img(
              :src="f.preview || f.content.thumbUrl[0]"
              :style=`{width: '100%', objectFit: 'contain'}` draggable="false")
          //- content add
          div(
            v-if="true"
            :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white
            q-btn(icon="add" color="primary" round outline size="lg" @click="contentAdd()")
          //- toggle fragments from workspace
          q-btn(
            v-if="false" :icon="fragmentsWorkspaceShow ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" outline color="grey-6"
            style=`height: 50px; borderRadius: 8px` no-caps
            @click="fragmentsWorkspaceShow = !fragmentsWorkspaceShow").full-width.q-mt-md
            span {{fragmentsWorkspaceShow ? 'Скрыть фрагменты из мастерской' : 'Показать фрагменты из мастерской'}}
          //- margin bottom
          div(:style=`{height: '100px'}`).row.full-width
    //- node preview
    div(:style=`{width: colWidth+'px', maxWidth: colWidth+'px', display: 'block'}`).full-height.q-px-sm
      .column.full-height
        //- header
        div(v-if="false" :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
          span.text-grey-8 Ядро
          .col
          q-btn(round flat color="grey-6" icon="more_vert")
        //- body
        div(:style=`{position: 'relative'}`).col.scroll.q-pt-sm
          //- node for preview
          node(:node="node" :nodeFullReady="node" inCreator :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).bg-white
          //- node edit btn
          q-btn(v-if="false" :style=`{position: 'absolute', zIndex: 1000, right: '15px', top: '20px', opacity: 0.9}`
            round flat dense icon="edit" color="white").bg-grey-9
          //- //- node creation tools
          //- div(:style=`{borderRadius: '10px'}`).row.full-width.bg-white.q-py-sm.q-mt-md
          //-   name-creator(:name="name" :spheres="spheres" @name="name = $event" @spheres="spheres = $event")
          //-   //- create button
          //-   .row.full-width.q-px-sm
          //-     q-btn(
          //-       no-caps color="primary" style=`height: 60px; borderRadius: 10px`
          //-       :disable="!nodePublishPossible"
          //-       :loading="nodePublishing" @click="nodePublish()").full-width.q-mt-md
          //-       span.text-bold.text-white Опубликовать
          //- //- bottom block for mobile
          //- div(:style=`{height: '60px'}`).row.full-width
          div(:style=`{zIndex: 10, marginTop: '-10px', borderRadius: '0 0 10px 10px', opacity: 0.8}`).row.full-width.items-end.bg-grey-2.q-pa-sm
            q-btn(outline color="primary" no-caps style=`height: 50px; borderRadius: 10px` @click="nodeEdit()").full-width.q-mt-lg.q-mb-sm
              span.text-bold Редактировать
            q-btn(
              no-caps color="primary" style=`height: 60px; borderRadius: 10px`
              :disable="!nodePublishPossible"
              :loading="nodePublishing" @click="nodePublish()").full-width.q-mb-sm
              span.text-bold.text-white Опубликовать
</template>

<script>
import node from 'components/node'
import contentFinder from 'components/content_finder'
import nodesWorkspace from 'pages/app/workspace/nodes'
import videoEditor from 'components/video_editor'
import nodeEditor from './node_editor'

export default {
  name: 'nodeCreator',
  components: {node, contentFinder, nodesWorkspace, videoEditor, nodeEditor},
  props: ['draft'],
  data () {
    return {
      fragments: [],
      fragmentsWorkspaceShow: true,
      fragmentEditing: undefined,
      name: '',
      spheres: [],
      spheresInput: '',
      videoEditorShow: false,
      nodeSaving: false,
      nodePublishing: false
    }
  },
  computed: {
    node: {
      get () {
        return {
          name: this.name,
          author: this.$store.state.auth.user,
          thumbUrl: this.fragments.map(f => {
            return f.preview || ''
          }),
          fragments: this.fragments,
          spheres: this.spheres,
          createdAt: Date.now()
        }
      },
      set (val) {
        // this.nodeRaw = val
      }
    },
    nodePublishPossible () {
      return this.fragments.length > 1 && this.name.length > 0
    },
    colWidth () {
      let w = this.$q.screen.width
      if (w > 500) return 500
      else return w
    }
  },
  watch: {
    node: {
      handler (to, from) {
        this.$log('node CHANGED', to)
        localStorage.setItem('nodeDraft', JSON.stringify(to))
      }
    },
    draft: {
      immediate: true,
      handler (to, from) {
        this.$log('draft CHANGED', to)
        if (to) {
          this.name = to.name
          this.spheres = to.spheres
          to.fragments.map((f, fi) => {
            f.preview = to.thumbUrl[fi]
            this.$set(this.fragments, this.fragments.length, f)
          })
        }
      }
    }
  },
  methods: {
    swipeDown () {
      this.$log('swipeDown')
      this.$q.notify('swipe down!')
      document.activeElement.blur()
    },
    contentAdd () {
      this.$log('contentAdd')
      this.$refs.contentFinderDialog.show()
    },
    fragmentAdd (content) {
      this.$log('fragmentAdd', content)
      this.$set(
        this.fragments,
        this.fragments.length,
        {
          id: Date.now().toString(),
          url: '',
          tags: [],
          relativePoints: [{x: 0}, {x: 10}],
          relativeScale: 0.00,
          preview: content.thumbUrl[0],
          content: content
        }
      )
    },
    fragmentDuplicate (f, index) {
      this.$log('fragmentDuplicate')
      // TODO: duplicate to the next position!
      let ff = JSON.parse(JSON.stringify(f))
      this.fragments.push(ff)
    },
    fragmentEdit (f, index) {
      this.$log('fragmentEdit', f, index)
      this.$set(this, 'fragmentEditing', index)
      switch (f.content.type) {
        case 'VIDEO': {
          this.$log('fragmentEdit', f.content.type)
          this.videoEditorShow = true
          this.$refs.videoEditorDialog.show()
          break
        }
        case 'IMAGE': {
          this.$log('fragmentEdit', f.content.type)
          // this.$refs.imageEditorDialog.show()
          break
        }
      }
    },
    fragmentSync (f) {
      this.$log('fragmentSync')
      this.$set(this.fragments, this.fragmentEditing, f)
    },
    fragmentEdited (f) {
      this.$log('fragmentEdited')
      this.$set(this.fragments, this.fragmentEditing, f)
      this.fragmentEditing = undefined
      this.$refs.videoEditorDialog.hide()
    },
    fragmentDelete (index) {
      this.$log('fragmentDelete', index)
      this.$delete(this.fragments, index)
    },
    nodeWorkspaceClick (n) {
      this.$log('nodeWorkspaceClick', n)
      n.fragments.map((f, fi) => {
        let fRaw = JSON.parse(JSON.stringify(f))
        fRaw.preview = n.thumbUrl[fi]
        this.fragments.push(fRaw)
      })
    },
    nodeEdit () {
      this.$log('nodeEdit')
      this.$refs.nodeEditorDialog.show()
    },
    async nodeSave () {
      this.$log('nodeSave')
      this.nodeSaving = true
      // await this.$wait(2000)
      this.$store.commit('workspace/updateNode', this.node)
      this.nodeSaving = false
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start', this.node)
        if (this.fragments.lenth < 2) return
        this.nodePublishing = true
        // prepare node
        // TODO: not prepare node but create node INPUT
        let n = JSON.parse(JSON.stringify(this.node))
        n.fragments.map(f => {
          f.oid = f.content.oid
          f.relativeScale = f.content.duration || 0
          delete f.id
          delete f.content
          delete f.url
          delete f.preview
        })
        delete n.author
        delete n.createdAt
        delete n.thumbUrl
        let {data: {nodeCreate}} = await this.$apollo.mutate({
          mutation: gql`
            mutation nodeCreate ($node: NodeInput!) {
              nodeCreate (node: $node) {
                oid
                type
                name
              }
            }
          `,
          variables: {
            node: n
          }
        })
        this.$log('nodePublish done', nodeCreate)
        this.nodePublishing = false
        // TODO: create new one? or go to node page?
        // TODO: delete current node and from node draft
        // TODO: create draft or update draft from workspace
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
