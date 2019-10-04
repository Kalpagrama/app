<template lang="pug">
.row.fit
  //- editors
  k-dialog(ref="nodeEditorDialog" :value="false")
    node-editor(:node="node" @hide="$refs.nodeEditorDialog.hide()"
      @name="name = $event" @spheres="spheres = $event" @meta="meta = $event")
  q-dialog(ref="videoEditorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    video-editor(
      v-if="content" :content="content" :fragments="fragmentsEditing"
      @create="$event => fragmentCreate(content, $event)" @update="fragmentUpdate" @delete="fragmentDelete"
      @hide="$refs.videoEditorDialog.hide(), content = null")
  //- content finder dialog position="bottom"
  k-dialog(ref="contentFinderDialog" :value="false")
    content-finder(@content="contentSelected" @close="$refs.contentFinderDialog.hide()")
  //- panels wrapper
  q-tab-panels(ref="kpanels" v-model="tab" :swipeable="$q.screen.lt.md" animated keep-alive :style=`{background: 'none', margin: 0, padding: 0}`).row.fit
    //- main desktop panel
    q-tab-panel(name="main" style=`margin: 0; padding: 0`).row.fit
      .row.fit.scroll
        div.row.full-height.no-wrap
          //- content finder wrapper
          div(v-if="false" :style=`{minWidth: colWidth+'px', maxWidth: colWidth+'px'}`).full-height.q-pa-sm.gt-sm
            content-finder(:style=`{
              borderRadius: '10px', overflow: 'hidden', zIndex: 100, maxHeight: '100%'}` @content="contentSelected")
          //- fragments selected wrapper
          div(v-if="true" :style=`{position: 'relative', maxWidth: colWidth+'px'}`).full-height
            node-fragments(:fragments="fragments" :colWidth="colWidth" @add="contentFind" @edit="$event => fragmentEdit($event.content)" @delete="fragmentDelete" @copy="fragmentCopy")
          //- node preview wrapper
          div(v-if="true" :style=`{minWidth: colWidth+'px', maxWidth: colWidth+'px'}`).gt-sm
            node-preview(
              :node="node" @edit="nodeEdit" @reset="nodeReset" @publish="nodePublish"
              :nodePublishPossible="nodePublishPossible" :nodePublishing="nodePublishing" :nodeSaving="nodeSaving")
    //- mobile panel
    q-tab-panel(name="preview" style=`margin: 0; padding: 0`)
      .row.fit
        node-preview(
          :node="node" @edit="nodeEdit" @reset="nodeReset" @publish="nodePublish"
          :nodePublishPossible="nodePublishPossible" :nodePublishing="nodePublishing" :nodeSaving="nodeSaving")
</template>

<script>
import contentFinder from 'components/content_finder'
import videoEditor from 'components/video_editor'
import nodeFragments from './node_fragments'
import nodePreview from './node_preview'
import nodeEditor from './node_editor'

export default {
  name: 'nodeCreator',
  components: {contentFinder, videoEditor, nodeFragments, nodePreview, nodeEditor},
  props: [],
  data () {
    return {
      tab: 'main',
      content: null,
      draft: null,
      fragments: {},
      uid: undefined,
      name: '',
      spheres: [],
      layout: 'PIP',
      layoutPolicy: 'DEFAULT',
      nodePublishing: false,
      nodeSaving: false
    }
  },
  computed: {
    node () {
      let fragments = []
      for (const f in this.fragments) {
        fragments.push(this.fragments[f])
      }
      return {
        uid: this.uid,
        name: this.name,
        author: this.$store.state.auth.user,
        thumbUrl: fragments.map(f => {
          return f.thumbUrl
        }),
        fragments: fragments.map(f => {
          return {
            uid: f.uid,
            oid: f.content.oid,
            content: f.content,
            label: f.label,
            thumbUrl: f.thumbUrl,
            relativePoints: f.relativePoints,
            relativeScale: f.relativeScale
          }
        }),
        spheres: this.spheres,
        createdAt: Date.now(),
        meta: {
          layout: this.layout,
          layoutPolicy: this.layoutPolicy,
          fragments: fragments.map(f => {
            return {uid: f.uid}
          })
        }
      }
    },
    nodePublishPossible () {
      return true
    },
    fragmentsEditing () {
      let fragments = {}
      for (const f in this.fragments) {
        if (this.fragments[f].content.oid === this.content.oid) {
          fragments[f] = this.fragments[f]
        }
      }
      return fragments
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
        // this.$log('node CHANGED', to)
        localStorage.setItem('draft', JSON.stringify(to))
      }
    }
  },
  methods: {
    contentFind () {
      this.$log('contentFind')
      this.$refs.contentFinderDialog.show()
    },
    async contentSelected (content) {
      this.$log('contentSelected', content)
      // close content finder dialog
      this.$refs.contentFinderDialog.hide()
      await this.$wait(300)
      let WSContent = await this.$store.dispatch('workspace/addWSContent', {name: content.name, content: {oid: content.oid}})
      // open editor
      this.fragmentEdit(WSContent.content)
    },
    fragmentCreate (content, f) {
      this.$log('fragmentCreate', content)
      let uid = f && f.uid ? f.uid : `${content.oid}-${Date.now()}`
      let fragment = null
      this.$set(this, 'content', content)
      switch (content.type) {
        case 'VIDEO': {
          fragment = {
            uid: uid,
            url: '',
            name: f && f.name ? f.name : '',
            relativePoints: f && f.relativePoints ? f.relativePoints : [],
            relativeScale: content.duration,
            content: content,
            thumbUrl: content.thumbUrl[0]
          }
          this.$set(this.fragments, uid, fragment)
          this.$refs.videoEditorDialog.show()
          break
        }
        case 'IMAGE': {
          fragment = {
            uid: uid,
            url: '',
            name: '',
            relativePoints: [],
            relativeScale: 0.00,
            content: content,
            thumbUrl: content.thumbUrl[0]
          }
          this.$set(this.fragments, uid, fragment)
          this.$refs.imageEditorDialog.show()
          break
        }
      }
    },
    fragmentCopy (f, fkey) {
      this.$log('fragmentCopy')
      let uid = `${f.content.oid}-${Date.now()}`
      let fragment = JSON.parse(JSON.stringify(f))
      fragment.uid = uid
      this.$set(this.fragments, uid, fragment)
    },
    fragmentUpdate () {
      this.$log('fragmentUpdate')
    },
    fragmentEdit (content) {
      this.$log('fragmentEdit', content)
      this.$set(this, 'content', content)
      switch (content.type) {
        case 'VIDEO': {
          this.$log('fragmentEdit', content.type)
          this.$refs.videoEditorDialog.show()
          break
        }
        case 'IMAGE': {
          this.$log('fragmentEdit', content.type)
          this.$refs.imageEditorDialog.show()
          break
        }
      }
    },
    fragmentDelete (f, fkey) {
      this.$log('fragmentDelete', f, fkey)
      this.$delete(this.fragments, f.uid)
    },
    nodeEdit () {
      this.$log('nodeEdit')
      this.$refs.nodeEditorDialog.show()
    },
    nodeReset () {
      this.$log('nodeReset')
      // save this node as draft
      // delete this node?
    },
    nodeInput (input) {
      let node = this.$strip(JSON.parse(JSON.stringify(input)))
      return {
        name: node.name,
        spheres: node.spheres,
        fragments: node.fragments.map(f => {
          return {
            uid: f.uid,
            oid: f.content.oid,
            name: f.name,
            thumbUrl: f.thumbUrl,
            relativePoints: f.relativePoints,
            relativeScale: f.relativeScale
          }
        }),
        meta: node.meta,
        categories: ['POLITICS', 'SPIRIT', 'EDUCATION', 'FUN', 'SCIENCE', 'HEALTH', 'SPORT']
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start', this.node)
        if (this.fragments.lenth < 2) return
        this.nodePublishing = true
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
            node: this.nodeInput(this.node)
          }
        })
        // delete ws draft
        if (this.draft) {
          let deleteWSDraft = await this.$store.dispatch('workspace/deleteWSDraft', this.draft)
          this.$log('deleteWSDraft', deleteWSDraft)
        }
        // remove draftLocal
        localStorage.removeItem('draft')
        // remove draftStorage
        this.$store.commit('workspace/state', ['draft', null])
        this.$log('nodePublish done', nodeCreate)
        this.nodePublishing = false
        // go to node page?
        this.$router.push(`/app/node/${nodeCreate.oid}`)
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    },
    useDraft (draft) {
      this.$set(this, 'uid', draft.uid)
      this.$set(this, 'name', draft.name)
      this.$set(this, 'spheres', draft.spheres)
      // this.$set(this, '')
      draft.fragments.map((f, fi) => {
        this.$set(this.fragments, f.uid, f)
      })
      this.$set(this, 'draft', draft)
    }
  },
  async mounted () {
    this.$log('mounted')
    // draft
    let draftLocal = this.$store.state.workspace.draft
    let draftStorage = this.$q.localStorage.getItem('draft')
    this.$log('draftLocal', draftLocal)
    this.$log('draftStorage', draftStorage)
    if (draftLocal) {
      if (draftStorage !== null && draftStorage !== 'null' && draftStorage !== 'undefined' && draftStorage !== undefined) {
        this.$log('DRAFTS: local, storage')
        // save old draft
        let d = JSON.parse(draftStorage)
        if (d.uid) await this.$store.dispatch('workspace/updateWSDraft', d)
        else await this.$store.dispatch('workspace/addWSDraft', d)
        // use draft
        this.useDraft(draftLocal)
        // remove draft local
        this.$store.commit('workspace/state', ['draft', null])
      } else {
        this.$log('DRAFTS: local')
        // use draft
        this.useDraft(draftLocal)
        // remove draft local
        this.$store.commit('workspace/state', ['draft', null])
      }
    } else {
      if (draftStorage !== null && draftStorage !== 'null' && draftStorage !== 'undefined' && draftStorage !== undefined) {
        this.$log('DRAFTS: storage')
        // use draft
        this.useDraft(JSON.parse(draftStorage))
      } else {
        this.$log('DRAFTS: none')
        // do nothing
      }
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
