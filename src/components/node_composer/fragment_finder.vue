<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.bg-grey-3
  div.col.full-width
    k-colls(@coll="coll = $event" :tabs="true" :header="false" :coll="coll" :colls="colls" :style="{height: '100%'}")
      template(v-slot:upload)
        div(:style=`{paddingTop: '100px'}`).row.full-width.q-px-sm
          //- by url
          .row.full-width
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
            //- q-input(
            //-   v-model="url"
            //-   :style=`{}`).full-width
            input(
              ref="inputUrl" type="url" :placeholder="$t('Paste URL')" @change="urlChanged"
              :style=`{height: '60px', width: '100%'}`).kinput
          //- from device
          div(
            @click="$refs.inputFile.click()"
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.cursor-pointer
            input(ref="inputFile" type="file" @change="fileChanged" :style=`{display: 'none'}`)
            span {{$t('or Pick file from device')}}
      template(v-slot:bookmarks)
          .column.fit
            .col.full-width.scroll
              .row.full-width.items-start.q-px-sm
                div(v-for="(b,bi) in bookmarks" :key="bi" :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
                  ).row.full-width.items-center.bg-white.q-px-sm.q-mb-sm
                  img(:style=`{height: '60px', objectFit: 'contain'}`).bg-black
                  .col.full-height
                    span {{ b.name | cut(50) }}
                div(v-if="bookmarks.length === 0").row.full-width.justify-center.q-py-xl
                  span You dont have any bookmarks
      template(v-slot:fragments)
        k-page(:noBackBtn="true")
          template(v-slot:header)
            q-btn(round flat icon="search")
            .col
            q-btn(round flat icon="more_vert")
          .column.fit
            .col.full-width.scroll
              .row.full-width.items-start.q-px-sm
                div(
                  v-for="(f,fi) in fragments" :key="fi" @click="fragmentClick(f,fi)"
                  :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
                  ).row.full-width.items-center.bg-white.q-mb-sm
                  div(:style=`{height: '60px', width: '100px', borderRadius: '10px', overflow: 'hidden'}`).bg-black
                    img(:src="f.thumbUrl" :style=`{objectFit: 'contain'}`).fit
                  .col.full-height
                    .row.fit.items-center.q-px-xs
                      span {{ f.name | cut(50) }}
                div(v-if="fragments.length === 0").row.full-width.justify-center.q-py-xl
                  span You dont have any fragments
</template>

<script>
// TODO: how to do q-gutter in upload and in everything else, paddingLeft: -5px?
import workspace from 'components/workspace'

export default {
  name: 'fragmentFinder',
  components: {workspace},
  data () {
    return {
      coll: 'fragments',
      colls: [
        {id: 'upload', name: 'Upload'},
        {id: 'bookmarks', name: 'Bookmarks'},
        {id: 'fragments', name: 'Fragments'}
      ],
      url: ''
    }
  },
  computed: {
    bookmarks () {
      return this.$store.state.workspace.workspace.bookmarks
    },
    fragments () {
      return this.$store.state.workspace.workspace.fragments
    }
  },
  methods: {
    async bookmarkClick (b, bi) {
      this.$log('bookmarkClick', b, bi)
      await this.$wait(200)
      this.$emit('hide')
    },
    async fragmentClick (f, fi) {
      this.$log('fragmentClick', f, fi)
      await this.$wait(200)
      this.$emit('fragment', f)
      // this.$emit('hide')
    },
    urlChanged (e) {
      this.$log('urlChanged', e)
    },
    fileChanged (e) {
      this.$log('fileChanged', e)
      let files = e.target.files
      this.$log('typof files', typeof files)
      // TODO: how to handle many files or one, or types
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

<style lang="stylus">
.kinput
  border none
  padding 10px
  &:focus
    outline: none
</style>
