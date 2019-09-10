<template lang="pug">
div(:style=`{overflowX: 'auto', overflowY: 'hidden', height: $q.screen.gt.sm ? 'calc(100vh)' : 'calc(100vh - 60px)'}`).row.full-width.scroll
  //- content find dialog
  q-dialog(ref="contentFinderDialog" position="bottom")
    content-finder(@content="fragmentAdd($event), $refs.contentFinderDialog.hide()")
  //- editors
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(v-if="videoEditorShow && fragments[fragmentEditing]" :fragment="fragments[fragmentEditing]" @fragment="fragmentSync" @ready="fragmentEdited" @close="videoEditorShow = false, $refs.videoEditorDialog.hide()")
  //- wrapper
  .row.full-height.no-wrap
    //- fragments from workspace
    div(v-if="false" v-show="fragmentsWorkspaceShow" :style=`{width: colWidth+'px', maxWidth: colWidth+'px', display: 'block'}`).full-height
      nodes-workspace(@nodeClick="nodeWorkspaceClick")
    //- fragment selected
    div(:style=`{width: colWidth+'px', maxWidth: colWidth+'px', display: 'block'}`).full-height.q-px-sm
      .column.full-height.q-py-md
        //- header
        div(v-if="true" :style=`{height: '60px', borderRadius: '10px'}`).row.full-width.items-center.q-px-sm.bg-white
          q-btn(v-show="!fragmentsWorkspaceShow" icon="keyboard_arrow_left" round flat color="grey-6" @click="fragmentsWorkspaceShow = true")
          span.text-grey-8 Фрагменты
          .col
          //- q-btn(round flat color="grey-6" icon="search")
          q-btn(round flat color="grey-6" icon="more_vert")
        //- body
        .col.scroll
          .row.full-width.items-start.q-pt-md
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
        .col.scroll.q-pt-md
          //- node for preview
          node(:node="node" :nodeFullReady="node" inCreator
            :style=`{borderRadius: '10px', overflow: 'hidden'}`).bg-white
          //- name
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-pa-sm.q-mt-md
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
              q-input(v-model="name" filled type="textarea" :rows="3" autogrow :maxlength="130" label="В чем суть?").full-width
          //- spheres
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-pa-sm.q-mt-md
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
              q-input(v-model="spheresInput" filled type="textarea" autogrow placeholder="Сфера1, сфера2, сфера3").full-width
          //- save
          //- publish
          q-btn(no-caps color="primary" style=`height: 60px; borderRadius: 10px` :loading="nodePublishing" @click="nodePublish()").full-width.q-mt-md
            span.text-bold.text-white Опубликовать
          q-btn(no-caps color="primary" style=`height: 45px; borderRadius: 10px` outline :loading="nodeSaving" @click="nodeSave()").full-width.q-mt-sm Сохранить в мастерскую
          div(style=`height: 60px`).row.full-width
</template>

<script>
import node from 'components/node'
import contentFinder from 'components/content_finder'
import nodesWorkspace from 'pages/app/workspace/nodes'
import videoEditor from 'components/video_editor'

export default {
  name: 'nodeCreator',
  components: {node, contentFinder, nodesWorkspace, videoEditor},
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
    nodesWorkspace () {
      return this.$store.state.workspace.workspace.nodes
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
            this.fragments.push(f)
          })
        }
      }
    }
  },
  methods: {
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
          relativePoints: [],
          relativeScale: 0,
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
    async nodeSave () {
      this.$log('nodeSave')
      this.nodeSaving = true
      // await this.$wait(2000)
      this.$store.commit('workspace/updateNode', this.node)
      this.nodeSaving = false
    },
    async nodePublish () {
      this.$log('nodePublish')
      this.nodePublishing = true
      await this.$wait(500)
      let n = this.node
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
      this.nodePublishing = false
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
