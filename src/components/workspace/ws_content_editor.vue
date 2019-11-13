<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).row.fit.bg-white
  div(:style=`{position: 'relative'}`).column.fit.bg-white
    //- header
    div(:style=`{position: 'absolute', zIndex: 1000, top: '0px', height: '70px', background: 'rgba(255, 255, 255, 0.9)'}`).row.full-width.items-center.content-center
      //- div(:style=`{width: '70px'}`).row.full-height.br
      //- name
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span.text-bold {{ contentLocal.name || content.name | cut(40) }}
      //- delete
      div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
        k-menu-popup(v-if="content" :name="'Удалить контент?'" :actions="actions" @action="contentDelete")
          q-btn(round flat icon="delete_outline" color="grey-6")
    //- body
    div(ignore-body-scroll-lock style=`padding: 80px 0`).col.scroll.full-width
      ws-tags-input(ref="wsTags" :tags="contentLocal.tagOids" @tags="contentLocal.tagOids = $event")
      //- .row.full-width
      //-   small {{ content }}
      //- .row.full-width
      //-   small {{ contentLocal }}
    //- footer
    div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px', height: '76px', background: 'rgba(255, 255, 255, 0.9)'}`).row.full-width.q-pa-sm
      q-btn(
        color="primary" no-caps @click="content.uid ? contentDraft() : contentCreate()"
        style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
        span.text-white.text-bold {{ content.uid ? 'Создать ядро' : 'Создать контент'}}
</template>

<script>
import wsTagsInput from './ws_tags_input'

export default {
  name: 'wsContentEditor',
  components: {wsTagsInput},
  props: ['type', 'content'],
  data () {
    return {
      contentLocal: {
        name: '',
        tagOids: [],
        content: {
          name: ''
        }
      },
      contentCreating: false,
      contentUpdating: false,
      contentDeleting: false,
      contentDrafting: false,
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ]
    }
  },
  methods: {
    async contentCreate () {
      try {
        this.$log('contentCreate start')
        this.contentCreating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/addWSContent', this.contentLocal)
        this.$log('contentCreate done')
        this.contentCreating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentCreate error', e)
        this.$q.notify(e.toString())
      }
    },
    async contentDelete () {
      try {
        this.$log('contentDelete start')
        this.contentDeleting = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/deleteWSContent', this.contentLocal.uid)
        this.$log('contentDelete done', res)
        this.contentDeleting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentDelete error', e, e.code, e.message)
        this.contentDeleting = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async contentUpdate () {
      try {
        this.$log('contentUpdate start')
        this.contentUpdating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/updateWSContent', this.contentLocal)
        this.$log('contentUpdate done')
        this.contentUpdating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentUpdate error', e)
        this.contentUpdating = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async contentDraft () {
      try {
        this.$log('contentDraft start')
        this.contentDrafting = true
        // create fragments
        let fragments = [
          {
            name: '',
            tagUids: [],
            thumbUrl: '',
            relativePoints: [{x: 0}, {x: 10}],
            relativeScale: 0,
            contentOid: this.contentLocal.content.oid
          }
        ]
        this.$log('fragments', fragments)
        let res = await this.$store.dispatch('workspace/addWSDraft', {fragments})
        this.$log('res', res)
        // go to node_creator
        this.$store.commit('workspace/stateSet', ['draft', res])
        this.$router.push('/app/create')
        this.$log('contentDraft done')
        this.contentDrafting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('contentDraft error', e)
        this.contentDrafting = false
      }
    }
  },
  mounted () {
    this.$log('mounted', this.content)
    if (this.content) {
      if (this.content.uid) this.$set(this, 'contentLocal', JSON.parse(JSON.stringify(this.content)))
      else this.$set(this.contentLocal, 'content', JSON.parse(JSON.stringify(this.content)))
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // if (this.content.uid) // this.contentUpdate()
  }
}
</script>
