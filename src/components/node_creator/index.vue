<template lang="pug">
.row.window-height
  //- editors
  //- k-dialog(ref="nodeEditorDialog" :value="false")
  //-   node-editor(:node="node" @hide="$refs.nodeEditorDialog.hide()"
  //-     @name="name = $event" @spheres="spheres = $event" @categories="categories = $event" @meta="meta = $event")
  //- panels wrapper
  q-tab-panels(ref="ncPanels" v-model="tab" :swipeable="$q.screen.lt.md" animated keep-alive :style=`{background: 'none', margin: 0, padding: 0}`).row.fit
    //- main desktop panel
    q-tab-panel(name="main" style=`margin: 0; padding: 0`).row.fit
      .row.fit.scroll
        div.row.full-height.no-wrap
          //- fragments
          div(:style=`{position: 'relative', maxWidth: colWidth+'px', minWidth: colWidth+'px', height: $q.screen.height+'px'}`).col
            node-fragments(@next="$refs.ncPanels.goTo('preview')"
              ref="nodeFragments" :fragments="fragments" :colWidth="colWidth" @create="$refs.contentFinderDialog.show()")
          //- node editor wrapper
          div(:style=`{minWidth: colWidth+'px', maxWidth: colWidth+'px'}`).col.gt-sm
            //- node-editor(
            //-   :node="node" :nodePublishing="nodePublishing" @update="nodeUpdate" @publish="nodePublish")
    //- mobile panel
    q-tab-panel(name="preview" style=`margin: 0; padding: 0`)
      .row.fit
        //- node-editor(@back="$refs.ncPanels.goTo('main')"
        //-   :node="node" :nodePublishing="nodePublishing" @update="nodeUpdate" @publish="nodePublish")
</template>

<script>
import nodeFragments from './node_fragments'
import nodeEditor from './node_editor'

export default {
  name: 'nodeCreator',
  components: {nodeFragments, nodeEditor},
  data () {
    return {
      tab: 'main',
      content: null,
      draft: null,
      uid: undefined,
      name: '',
      fragments: {},
      layout: 'PIP',
      layoutPolicy: 'DEFAULT',
      spheres: [],
      categories: [],
      nodePublishing: false
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
            name: f.name,
            thumbUrl: f.thumbUrl,
            relativePoints: f.relativeCuts.reduce((acc, val) => {
              acc.push({x: val.start})
              acc.push({x: val.end})
              return acc
            }, []),
            relativeScale: f.relativeScale
          }
        }),
        spheres: this.spheres,
        categories: this.categories,
        createdAt: Date.now(),
        meta: {
          layout: this.layout,
          // layoutPolicy: this.layoutPolicy,
          fragments: fragments.map(f => {
            return {uid: f.uid}
          })
        }
      }
    },
    readyForPreview () {
      if (Object.keys(this.fragments).length > 1) return true
      else return false
    },
    readyForPublish () {
      return false
    },
    colWidth () {
      let w = this.$q.screen.width
      if (w > 500) return 500
      else return w
    }
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        localStorage.setItem('draft', JSON.stringify(to))
      }
    }
  },
  methods: {
    async nodeUpdate (key, val) {
      this.$log('nodeUpdate', key, val)
      this[key] = val
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        await this.$wait(3000)
        // create mutation
        let node = await this.$store.dispatch('node/nodeCreate', this.node)
        // delete ws draft
        if (this.draft) {
          let deleteWSDraft = await this.$store.dispatch('workspace/deleteWSDraft', this.draft)
          this.$log('deleteWSDraft', deleteWSDraft)
        }
        // remove draftLocal
        localStorage.removeItem('draft')
        // remove draftStorage
        this.$store.commit('workspace/state', ['draft', null])
        // done
        this.$log('nodePublish done', node)
        this.nodePublishing = false
        // go to home
        this.$router.push(`/app/home`)
      } catch (error) {
        this.$log('nodePublis error', error)
        this.nodePublishing = false
        this.$q.notify({message: 'Node publish error!', color: 'red', textColor: 'white'})
      }
    },
    useDraft (draft) {
      this.$set(this, 'uid', draft.uid)
      this.$set(this, 'name', draft.name)
      this.$set(this, 'spheres', draft.spheres)
      this.$set(this, 'categories', draft.categories)
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
    // this.$log('draftLocal', draftLocal)
    // this.$log('draftStorage', draftStorage)
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
