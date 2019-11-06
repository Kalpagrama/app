<template lang="pug">
q-layout(view="hHh lpR lff" :style=`{height: '100vh'}`).column.bg-primary
  k-dialog-bottom(ref="nodeCreatorDialog" mode="actions" :options="nodeCreatorDialogOptions" @action="nodeCreatorAction")
  q-header
    div(:style=`{height: '60px'}`).row.full-width
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="menu" color="grey-3" @click="$refs.nodeCreatorDialog.toggle()")
      .col.full-height
        .row.fit.items-center.justify-center.q-px-md
          span.text-bold Node creator
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="clear" @click="$emit('hide')")
    q-tabs(v-model="tab" @input="tabChanged")
      q-tab(no-caps name="fragments" label="Fragments")
      q-tab(no-caps name="preview" label="Preview")
  q-page-container.col
    q-tab-panels(v-model="tab" @input="tabChanged" :swipeable="$q.screen.lt.md" animated keep-alive :style=`{background: 'none', margin: 0, padding: 0}`).fit
      q-tab-panel(name="fragments" style=`margin: 0; padding: 0`)
        node-fragments(:tab="tabLocal" :fragments="fragments")
      q-tab-panel(name="preview" style=`margin: 0; padding: 0`)
        node-preview(:tab="tabLocal" :node="node")
</template>

<script>
import nodeFragments from './node_fragments'
import nodePreview from './node_preview'
import helper from './helper'

export default {
  name: 'nodeCreator',
  components: {nodeFragments, nodePreview, helper},
  data () {
    return {
      tab: 'fragments',
      tabLocal: 'fragments',
      draft: null,
      uid: undefined,
      name: '',
      fragments: {},
      layout: 'PIP',
      layoutPolicy: 'DEFAULT',
      spheres: [],
      categories: []
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
        fragments: fragments.map(f => {
          this.$log('f', f)
          return {
            uid: f.uid,
            oid: f.content.oid,
            content: f.content,
            name: f.name,
            thumbUrl: f.thumbUrl,
            relativeCuts: f.relativeCuts,
            relativeScale: f.relativeScale
          }
        }),
        spheres: this.spheres,
        categories: this.categories,
        createdAt: Date.now(),
        meta: {
          layout: this.layout,
          fragments: fragments.map(f => {
            return {uid: f.uid, thumbUrl: f.thumbUrl}
          })
        }
      }
    },
    nodeCreatorDialogOptions () {
      return {
        confirm: false,
        confirmName: '',
        actions: {
          mydrafts: {name: 'My drafts'},
          new: {name: 'Start a new one'},
          share: {name: 'Share with friend'},
          settings: {name: 'Settings'},
          help: {name: 'How does it works?!'}
        }
      }
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
    nodeCreatorAction (e) {
      this.$log('nodeCreatorAction', e)
    },
    async tabChanged (tab) {
      // this.$log('tabChanged', tab)
      this.tabLocal = undefined
      await this.$wait(300)
      this.tabLocal = tab
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
