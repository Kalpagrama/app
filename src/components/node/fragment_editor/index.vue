<template lang="pug">
.row.full-width.items-start.content-start
  div(:style=`{position: 'relative', minHeight: '74px', borderRadius: '0px 0px 0 0', overflow: 'hidden'}`).row.full-width
    fragment-finder(
      v-if="!fragment"
      @fragment="fragmentFound")
    //- actions
    q-btn(
      v-if="fragment"
      round flat icon="clear" color="red" :loading="fragmentDeleting" @click="fragmentDelete()"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.5)'}`
      ).shadow-5
    q-btn(
      v-if="fragment"
      round push color="green" @click="fragmentEdit()"
      :icon="fragmentEditing ? 'check' : 'edit'"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', bottom: '30px'}`)
    fragment(
      v-if="fragment"
      ctx="inEditor" :fragment="fragment"
      @previewHeight="fragmentHeight = $event" @previewWidth="fragmentWidth = $event"
      @player="fragmentPlayer = $event")
  //- fixed editor!
  div(
    v-if="fragment && fragmentPlayer"
    :style=`{
      position: 'fixed', zIndex: 200, left: 0, top: fragmentHeight+'px',
      height: fragmentEditing ? $q.screen.height-fragmentHeight-60+'px' : 0+'px'}`
    ).row.full-width.justify-center
    fragment-editor-video(
      :fragment="fragment" :player="fragmentPlayer" :width="fragmentWidth" :height="$q.screen.height-fragmentHeight-60"
      :editing="fragmentEditing"
      :style=`{
        positio: 'relative',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        height: fragmentEditing ? $q.screen.height-fragmentHeight-60+'px' : 0+'px'}`).row.full-width.bg-black
  //- text notes
  .row.full-width.items-start.content-start
    div(:style=`{height: '60px', borderBottom: '1px solid #eee', marginTop: fragment ? '10px' : '0px'}`
      ).row.full-width.items-center.justify-between.q-px-sm.bg-white
      q-btn(round flat icon="menu" color="green" @click="$emit('menu')")
      .col
      q-btn(flat no-caps color="red" :loading="fragmentPurging" @click="fragmentPurge()").q-mr-xl
        span.text-bold Purge
      q-btn(push no-caps color="green" :loading="fragmentSaving" @click="fragmentSave()")
        span.text-bold Save
    textarea(
      ref="nameTextarea"
      v-model="fragmentName"
      :style=`{
        height: fragmentEditing ? $q.screen.height-fragmentHeight-60-60+'px' : $q.screen.height-60-60+'px',
        paddingTop: '10px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px',
        margin: 0}`).row.full-width.kinput
</template>

<script>
import fragment from '../fragment'
import fragmentFinder from './fragment_finder'
import fragmentEditorVideo from './fragment_editor_video'

export default {
  name: 'fragmentEditor',
  components: {fragment, fragmentFinder, fragmentEditorVideo},
  props: ['ctx'],
  data () {
    return {
      fragmentName: '',
      fragment: null,
      fragmentEditing: false,
      fragmentDeleting: false,
      fragmentPurging: false,
      fragmentPlayer: null,
      fragmentHeight: 0,
      fragmentWidth: 0,
      fragmentSaving: false
    }
  },
  watch: {
    fragmentEditing: {
      handler (to, from) {
        this.$log('fragmentEditing CHANGED', to)
        if (to) this.$emit('bg', 'black')
        else this.$emit('bg', 'white')
      }
    }
  },
  methods: {
    async fragmentSave () {
      this.$log('fragmentSave')
      this.fragmentSaving = true
      await this.$wait(600)
      if (this.fragment) this.fragment.name = this.fragmentName
      let node = {
        layout: 'PIP',
        fragments: [this.fragment],
        name: this.fragmentName,
        categories: ['FUN'],
        spheres: []
      }
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
      this.$log('res', res)
      await this.fragmentPurge(true)
      this.fragmentSaving = false
    },
    async fragmentUse (fragment) {
      this.$log('fragmentUse', fragment)
      await this.fragmentSave()
      this.fragmentFound(fragment)
    },
    fragmentFound (fragment) {
      this.$log('fragmentFound', fragment)
      this.fragment = JSON.parse(JSON.stringify(fragment))
    },
    fragmentEdit () {
      this.$log('fragmentEdit')
      this.fragmentEditing = !this.fragmentEditing
    },
    async fragmentPurge (ignoreConfirm) {
      this.$log('fragmentPurge')
      this.fragmentPurging = true
      await this.$wait(600)
      let confirmed = false
      if (!ignoreConfirm) confirmed = confirm('Purge fragment?')
      else confirmed = true
      if (confirmed) {
        this.fragmentName = ''
        await this.fragmentDelete(true)
      }
      this.fragmentPurging = false
    },
    async fragmentDelete (ignoreConfirm) {
      this.$log('fragmentDelete')
      this.fragmentDeleting = true
      await this.$wait(600)
      let confirmed = false
      if (!ignoreConfirm) confirmed = confirm('Delete fragment?')
      else confirmed = true
      if (confirmed) {
        this.fragmentEditing = false
        this.fragment = null
        this.fragmentWidth = 0
        this.fragmentHeight = 0
        this.fragmentPlayer = null
      }
      this.fragmentDeleting = false
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.$refs.nameTextarea.focus()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
