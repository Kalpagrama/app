<template lang="pug">
.column.fit.bg-white
  q-dialog(ref="sourceUrlDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-url(@hide="$refs.sourceUrlDialog.hide()" @oid="contentFound")
  q-dialog(ref="sourceDeviceDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-device(@hide="$refs.sourceDeviceDialog.hide()")
  q-dialog(ref="sourceWsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    source-ws(@hide="$refs.sourceWsDialog.hide()" @input="")
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Fragment finder {{ source }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-md.q-pt-lg
      .row.full-width.q-pa-sm
        span.text-bold Upload
      .row.full-width.q-mb-lg
        div(:style=`{height: '50px', borderRadius: '10px'}` @click="$refs.sourceUrlDialog.show()").col.bg-grey-2
          .row.fit.items-center.justify-center
            span by URL
        div(:style=`{height: '50px', borderRadius: '10px'}` @click="$refs.sourceDeviceDialog.show()").col.bg-grey-2.q-ml-sm
          .row.fit.items-center.justify-center
            span from device
      .row.full-width.q-pa-sm
        span.text-bold Pick from Workspace
      .row.full-width
        div(
          v-for="(w, wi) in wsStats" :key="wi" @click="$refs.sourceWsDialog.show()"
          :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-px-md.bg-grey-2.q-mb-md.cursor-pointer
          span {{ w.name }}
          .col
          span {{ w.count }}
</template>

<script>
import sourceDevice from './source_device'
import sourceUrl from './source_url'
import sourceWs from './source_ws'

export default {
  name: 'fragmentFinder',
  components: {sourceDevice, sourceUrl, sourceWs},
  data () {
    return {
      source: undefined,
      wsStats: [
        {id: 'bookmarks', name: 'Bookmarks', count: 10},
        {id: 'contents', name: 'Contents', count: 1},
        {id: 'fragments', name: 'Fragments', count: 2},
        {id: 'drafts', name: 'Drafts', count: 13}
      ]
    }
  },
  methods: {
    async contentFound (oid) {
      this.$log('contentFound', oid)
      let content = await this.contentGet(oid)
      let fragment = await this.fragmentCreate(content)
      this.$log('fragment', fragment)
      this.$emit('fragment', fragment)
      this.$emit('hide')
    },
    fragmentUse () {},
    async fragmentCreate (content, f) {
      this.$log('fragmentCreate', content, f)
      let uid = `${content.oid}-${Date.now()}`
      let fragment = null
      switch (content.type) {
        case 'VIDEO': {
          fragment = {
            uid: uid,
            name: content.name,
            relativeCuts: [],
            relativeScale: content.duration,
            content: content,
            thumbUrl: ''
          }
          break
        }
        case 'IMAGE': {
          fragment = {
            uid: uid,
            name: '',
            relativeCuts: [],
            relativeScale: 0.00,
            content: content,
            thumbUrl: []
          }
          this.$set(this.fragments, uid, fragment)
          break
        }
      }
      return fragment
    },
    async contentGet (oid) {
      this.$log('contentGet start', oid)
      let {data: {objectList: [content]}} = await this.$apollo.query({
        query: gql`
          query contentGet ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
              name
              ... on Video {
                url
                urlOriginal
                duration
                width
                height
              }
              ... on Image {
                url
                urlOriginal
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('contentGet done', content)
      return content
    }
  },
  mounted () {
    this.$log('mounted')
    // url, create content, and then empty fragment
    // device, create content and then empty fragment
    // from bookmark, create content and then empty fragment
    // from content, create empty fragment
    // from fragment, take ready fragment
    // from draft, take all the fragments?
    // add bookmark, add content, add fragment
    // by url, by device, add to workspace, add what?
    // ws we got it?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
