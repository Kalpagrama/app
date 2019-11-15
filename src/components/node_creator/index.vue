<template lang="pug">
.column.fit.bg-primary
  //- k-dialog-bottom(ref="nodeCreatorDialog" mode="actions" :options="nodeCreatorDialogOptions" @action="nodeCreatorAction")
  q-dialog(ref="nodeCreatorDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    .column.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width
        .col.full-height
          .row.fit.items-center.q-px-md
            span.text-bold Ядрогенератор
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat icon="clear" @click="$refs.nodeCreatorDialog.hide()")
      .col.full-width.scroll
        .row.full-width.items-start.content-start
          div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
            span start new node
          div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
            span Мои ядра
  .row.full-width
    div(:style=`{height: '60px'}`).row.full-width
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="menu" color="grey-3" @click="$refs.nodeCreatorDialog.toggle()")
      .col.full-height
        .row.fit.items-center.justify-start
          span.text-bold.text-white Ядрогенератор
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="clear" color="white" @click="$emit('hide')")
    q-tabs(v-model="tab" @input="tabChanged" align="left" color="white").full-width
      q-tab(no-caps name="fragments" label="Фрагменты" color="white" :style=`{color: 'white'}`)
      q-tab(no-caps name="preview" label="Предосмотр" :style=`{color: 'white'}`)
  .col
    q-tab-panels(v-model="tab" @input="tabChanged" swipeable animated keep-alive :style=`{background: 'none', margin: 0, padding: 0}`).fit
      q-tab-panel(name="fragments" :style=`{height: '100%', margin: 0, padding: 0}`)
        node-fragments(:tab="tabLocal" :fragments="fragments")
      q-tab-panel(name="preview" :style=`{height: '200px', margin: 0, padding: 0}`)
        .row.full-width.justify-center
          div(:style=`{position: 'relative', maxWidth: '500px', paddingBottom: '70px'}`).row.justify-start.content-start.q-pt-sm.q-px-sm
            node(
              :node="node" :nodeFull="node"
              :style=`{borderRadius: '10px'}`).bg-white.q-mb-md
            div(
              :style=`{height: 'auto', borderRadius: '10px'}`
              ).row.full-width.items-end.bg-white.q-pa-md.q-mb-md
              .row.full-width.q-pa-sm
                span.text-bold В чем суть?
              div(:style=`{position: 'relative', zIndex: 100, overflow: 'hidden', borderRadius: '10px'}`).row.full-width
                q-input(v-model="name" filled type="textarea" :rows="3").full-width
            div(
              :style=`{borderRadius: '10px'}`
              ).row.full-width.bg-white.q-mb-md
              .row.full-width.items-start.content-start.q-pa-md
                .row.full-width.q-pa-sm
                  span.text-bold Шаблон
                div(:style=`{height: '56px', borderRadius: '10px'}`).row.full-width.items-center.justify-between.q-px-sm.bg-grey-3
                  span Картинка в картинке
                  q-icon(size="26px" name="keyboard_arrow_down")
                //- .row.full-width.q-pa-sm
                //-   span.text-bold Категория
                //- div(:style=`{height: '56px', borderRadius: '10px'}`).row.full-width.items-center.justify-between.q-px-sm.bg-grey-2
                //-   span(:style=`{borderRadius: '10px'}`).bg-green.q-px-md.q-py-sm.text-white #Развлечения
                //-   q-icon(size="26px" name="keyboard_arrow_down")
                node-editor-categories(:value="categories" @input="categories = $event")
            transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
              q-btn(
                v-if="tab === 'preview'"
                color="green" push no-caps @click="publish()"
                :loading="publishing"
                :style=`{position: 'absolute', left: '8px', bottom: '8px', height: '60px',
                  width: 'calc(100% - 16px)', borderRadius: '10px'}`)
                span.text-bold Опубликовать
</template>

<script>
import nodeFragments from './node_fragments'
import nodePreview from './node_preview'
import helper from './helper'
import nodeEditorCategories from './node_editor_categories'

export default {
  name: 'nodeCreator',
  components: {nodeFragments, nodePreview, helper, nodeEditorCategories},
  props: ['width', 'height'],
  data () {
    return {
      tab: 'fragments',
      tabLocal: 'fragments',
      draft: null,
      fragments: {},
      uid: '',
      name: '',
      layout: 'PIP',
      categories: [],
      spheres: [],
      publishing: false
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
          // this.$log('f', f)
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
    nodeCreatorAction (action) {
      this.$log('nodeCreatorAction', action)
      switch (action) {
        case 'mydrafts': {
          this.$log('DRAFTS')
          break
        }
      }
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
    },
    async publish () {
      try {
        this.$log('nodePublish start', this.node)
        this.publishing = true
        // await this.$wait(3000)
        // create mutation
        // TODO: take name and categories from node computed, from here?
        // this.node.name = this.name
        // this.node.categories = ['FUN']
        let node = await this.$store.dispatch('node/nodeCreate', this.node)
        // delete ws draft
        if (this.draft) {
          let deleteWSDraft = await this.$store.dispatch('workspace/deleteWSDraft', this.draft)
          this.$log('deleteWSDraft', deleteWSDraft)
        }
        // remove draftLocal
        localStorage.removeItem('draft')
        // remove draftStorage
        this.$store.commit('workspace/stateSet', ['draft', null])
        // done
        this.$log('nodePublish done', node)
        this.publishing = false
        // go to home
        this.$router.push(`/app/home`)
      } catch (error) {
        this.$log('nodePublis error', error)
        this.publishing = false
        this.$q.notify({message: 'Node publish error!', color: 'red', textColor: 'white'})
      }
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
        this.$store.commit('workspace/stateSet', ['draft', null])
      } else {
        this.$log('DRAFTS: local')
        // use draft
        this.useDraft(draftLocal)
        // remove draft local
        this.$store.commit('workspace/stateSet', ['draft', null])
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
