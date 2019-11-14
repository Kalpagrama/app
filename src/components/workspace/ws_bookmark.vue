<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- create/update
  q-btn(
    color="green" no-caps push @click="bookmarkCreate()"
    :style=`{position: 'absolute', bottom: '8px', left: '8px', width: 'calc(100% - 16px)', height: '60px', borderRadius: '10px'}`)
    span.text-bold Create bookmark
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold New bookmark
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
      url: '',
      name: '',
      body: ''
    }
  },
  methods: {
    bookmarkCreate () {
      this.$log('bookmarkCreate')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
