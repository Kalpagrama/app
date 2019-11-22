<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- create/update
  q-btn(
    color="green" no-caps push :loadig="creating" @click="bookmarkCreate()"
    :style=`{position: 'absolute', bottom: '8px', left: '8px', width: 'calc(100% - 16px)', height: '60px', borderRadius: '10px'}`)
    span.text-bold {{ $t('Create') }}
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{ $t('Новая заметка') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-md
        q-input(v-model="url" filled placeholder="Url").full-width
      div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-md
        q-input(v-model="name" filled placeholder="Title").full-width
      div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-md
        q-input(v-model="body" filled placeholder="Note" type="textarea" :rows="10").full-width
</template>

<script>
export default {
  name: 'wsBookmark',
  data () {
    return {
      creating: false,
      loadig: false,
      url: '',
      name: '',
      body: ''
    }
  },
  methods: {
    async bookmarkCreate () {
      try {
        this.$log('bookmarkCreate start')
        this.creating = true
        let bookmark = {
          name: this.name,
          url: this.url,
          tagUids: []
        }
        let res = await this.$store.dispatch('workspace/addWSBookmark', bookmark)
        this.$log('bookmarkCreate done', res)
        this.creating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('bookmarkCreate error', e)
        this.creating = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    let bookmark = this.$store.state.ui.bookmark
    this.$log('bookmark', bookmark)
    let node = this.$store.state.ui.node
    this.$log('node', node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['bookmark', null])
    this.$store.commit('ui/stateSet', ['node', null])
  }
}
</script>
