<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- header
  div(:style=`{height: '70px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        //- span.text-bold {{ fragment.name | cut(50) }}
        span.text-bold Добавить фрагмент в мастерскую
    div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
      k-menu-popup(v-if="fragment.uid" :name="'Удалить фрагмент?'" :actions="actions" @action="fragmentDelete")
        q-btn(round flat icon="delete_outline" color="grey-6")
    //- img(v-if="fragment.thumbUrl"
    //-   :src="fragment.thumbUrl" :style=`{width: '100%'}`)
  //- body
  .col.scroll.full-width
    //- small {{ fragment }}
    .row.full-width.q-pa-sm
      div(style=`borderRadius: 10px; overflow: hidden`).row.full-width
        q-input(v-model="fragment.name" filled placeholder="Имя фрагмента").full-width
    ws-tags-input(:tags="fragment.tagUids" @tags="fragment.tagUids = $event").q-mt-sm
    //- TODO: fragment preview...
    div(v-if="false").row.full-width.q-pa-sm
      div(:style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.justify-center.bg-grey-2
        small {{ fragment }}
  //- actions
  transition(
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!loading"
      color="primary" no-caps :loading="fragmentCreating" @click="fragmentCreate()"
      :style=`{position: 'absolute', width: 'calc(100% - 20px)', left: '10px', bottom: '10px', height: '60px', borderRadius: '10px'}`)
      span.text-bold.text-white Добавить фрагмент
</template>

<script>
import wsTagsInput from './ws_tags_input'

export default {
  name: 'wsFragmentEditor',
  components: {wsTagsInput},
  data () {
    return {
      loading: true,
      fragment: {
        name: '',
        tagUids: []
      },
      fragmentCreating: false,
      fragmentDeleting: false,
      fragmentUpdating: false,
      fragmentDrafting: false,
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ]
    }
  },
  methods: {
    async fragmentCreate () {
      try {
        this.$log('fragmentCreate start', this.fragment)
        this.fragmentCreating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/addWSFragment', this.fragment)
        this.$log('fragmentCreate done', res)
        this.fragmentCreating = false
        // this.$set(this, 'fragment', res)
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
        // let res = await this.$store.dispatch('workspace/updateWSFragment', this.fragment)
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
        // let res = await this.$store.dispatch('workspace/deleteWSFragemnt', this.fragment.uid)
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
        await this.$wait(1000)
        // // create fragments
        // let fragments = [
        //   {
        //     name: this.fragment.name,
        //     tagUids: this.fragment.tagUids,
        //     thumbUrl: this.fragment.thumbUrl,
        //     relativePoints: this.fragment.relativePoints.map(p => ({x: p.x, y: p.y, z: p.z})),
        //     relativeScale: this.fragment.relativeScale,
        //     contentOid: this.fragment.content.oid
        //   }
        // ]
        // this.$log('fragments', fragments)
        // let res = await this.$store.dispatch('workspace/addWSDraft', {fragments})
        // this.$log('res', res)
        // // go to node_creator
        // this.$store.commit('workspace/state', ['draft', res])
        // this.$router.push('/app/create')
        this.$log('fragmentDraft done')
        this.fragmentDrafting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('fragmentDraft error', e)
        this.fragmentDrafting = false
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    let fragment = JSON.parse(JSON.stringify(this.$store.state.workspace.fragment))
    let fragments = this.$store.getters['workspace/fragments']
    this.$log('fragments', fragments)
    let fragmentInWs = this.$store.getters['workspace/fragments'][fragment.uid]
    this.$log('fragmentInWs', fragmentInWs)
    // if we got this fragment in ws already...
    this.$set(this, 'fragment', fragment)
    await this.$wait(200)
    this.loading = false
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('workspace/state', ['fragment', null])
  }
}
</script>
