<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  div(:style=`{height: '70px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold {{ fragmentLocal.name || 'Новый фрагмент' | cut(50) }}
    div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
      k-menu-popup(v-if="fragmentLocal.uid" :name="'Удалить фрагмент?'" :actions="actions" @action="fragmentDelete")
        q-btn(round flat icon="delete_outline" color="grey-6")
  .col.scroll.full-width
    .row.full-width.q-pa-sm
      div(style=`borderRadius: 10px; overflow: hidden`).row.full-width
        q-input(v-model="fragmentLocal.name" filled placeholder="Name").full-width
    ws-tags-input(:tags="fragmentLocal.tagUids" @tags="fragmentLocal.tagUids = $event")
    //- TODO: fragment preview...
    .row.full-width.q-pa-sm
      div(:style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.justify-center.bg-grey-2
        span fragment preview
    //- debug
    //- .row.full-width
    //-   small fragmentLocal
    //- .row.full-width
    //-   small {{ fragmentLocal }}
    //- .row.full-width
    //-   small fragment
    //- .row.full-width
    //-   small {{ fragment }}
  div(:style=`{height: '80px'}`).row.full-width.q-pa-sm
    q-btn(
      v-if="!fragmentLocal.uid" @click="fragmentCreate()"
      :loading="fragmentCreating" no-caps color="primary" style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-bold.text-white Создать фрагмент
    q-btn(
      v-else @click="fragmentDraft()"
      no-caps color="primary" style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-bold.text-white Создать ядро
</template>

<script>
import wsTagsInput from './ws_tags_input'

export default {
  name: 'wsFragmentEditor',
  components: {wsTagsInput},
  props: ['type', 'fragment'],
  data () {
    return {
      loading: true,
      fragmentCreating: false,
      fragmentDeleting: false,
      fragmentUpdating: false,
      fragmentDrafting: false,
      fragmentLocal: {
        name: '',
        tagUids: []
      },
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ]
    }
  },
  methods: {
    async fragmentCreate () {
      try {
        this.$log('fragmentCreate start', this.fragmentLocal)
        this.fragmentCreating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/addWSFragment', this.fragmentLocal)
        this.$log('fragmentCreate done')
        this.fragmentCreating = false
        // this.$set(this, 'fragmentLocal', res)
        this.$emit('hide')
      } catch (e) {
        this.$log('fragmentCrete error', e)
        this.fragmentCreating = false
        this.$emit('hide')
      }
    },
    async fragmentUpdate () {
      try {
        this.$log('fragmentUdpate start')
        this.fragmentUpdating = true
        await this.$wait(600)
        // let res = await this.$store.dispatch('workspace/updateWSFragment', this.fragmentLocal)
        this.$log('fragmentUpdate done')
        this.fragmentUpdating = false
        this.$emit('hide')
      } catch (error) {
        this.$log('fragmentUpdate error', error)
      }
      this.$log('fragmentUpdate')
    },
    async fragmentDelete () {
      try {
        this.$log('fragmentDelete start')
        this.fragmentDeleting = true
        await this.$wait(600)
        // let res = await this.$store.dispatch('workspace/deleteWSFragemnt', this.fragmentLocal.uid)
        this.$log('fragmentDelete done')
        this.fragmentDeleting = false
        this.$emit('hide')
      } catch (error) {
        this.$log('fragmentDelete error', error)
      }
      this.$log('fragmentDelete start')
    },
    async fragmentDraft () {
      try {
        this.$log('fragmentDraft start')
        this.fragmentDrafting = true
        // create fragments
        let fragments = [
          {
            name: this.fragmentLocal.name,
            tagUids: this.fragmentLocal.tagUids,
            thumbUrl: this.fragmentLocal.thumbUrl,
            relativePoints: this.fragmentLocal.relativePoints.map(p => ({x: p.x, y: p.y, z: p.z})),
            relativeScale: this.fragmentLocal.relativeScale,
            contentOid: this.fragmentLocal.content.oid
          }
        ]
        this.$log('fragments', fragments)
        let res = await this.$store.dispatch('workspace/addWSDraft', {fragments})
        this.$log('res', res)
        // go to node_creator
        this.$store.commit('workspace/state', ['draft', res])
        this.$router.push('/app/create')
        this.$log('fragmentDraft done')
        this.fragmentDrafting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('fragmentDraft error', e)
        this.fragmentDrafting = false
      }
    }
  },
  mounted () {
    this.$log('mounted', this.fragment)
    let fragment = JSON.parse(JSON.stringify(this.fragment))
    this.$set(this, 'fragmentLocal', fragment)
    this.$nextTick(() => {
      this.loading = false
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
