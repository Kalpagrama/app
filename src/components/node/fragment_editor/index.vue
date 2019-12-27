<template lang="pug">
.row.full-width.items-start.content-start
  div(:style=`{position: 'relative', minHeight: '74px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width
    //- actions
    //- delete fragment
    q-btn(
      v-if="fragment"
      round flat icon="clear" color="red" :loading="fragmentDeleting" @click="fragmentDelete()"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.5)'}`
      ).shadow-5
    q-btn(
      v-if="fragment"
      round push icon="edit" color="green" @click="fragmentEdit()"
      :style=`{position: 'absolute', zIndex: 1000, right: '16px', bottom: '30px'}`)
    fragment(
      v-if="fragment"
      ctx="inEditor" :fragment="fragment")
    fragment-finder(
      v-else
      @fragment="fragmentFound")
  .row.full-width.items-start.content-start
    textarea(
      ref="nameTextarea"
      v-model="name" rows="10"
      :style=`{
        height: $q.screen.height-60-74+'px',
        paddingTop: '10px', paddingBottom: '10px',
        margin: 0}`).row.full-width.kinput
</template>

<script>
import fragment from '../fragment'
import fragmentFinder from './fragment_finder'

export default {
  name: 'fragmentEditor',
  components: {fragment, fragmentFinder},
  props: ['ctx'],
  data () {
    return {
      fragment: null,
      fragmentEditing: false,
      fragmentDeleting: false
    }
  },
  methods: {
    fragmentFound (fragment) {
      this.$log('fragmentFound', fragment)
      this.fragment = fragment
    },
    fragmentEdit () {
      this.$log('fragmentEdit')
    },
    async fragmentDelete () {
      this.$log('fragmentDelete')
      this.fragmentDeleting = true
      await this.$wait(600)
      if (confirm('Delete fragment?')) {
        this.fragment = null
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
