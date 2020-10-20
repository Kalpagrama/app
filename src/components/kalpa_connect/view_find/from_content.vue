<template lang="pug">
.row.full-width.items-start.content-start
  //- q-dialog(
    v-model="contentExtractorOpened" position="bottom" maximized
    @hide="contentBookmark = null")
    from-content-extract(
      :contentBookmark="contentBookmark"
      :style=`{maxWidth: width+'px',}`
      @item="$emit('item', $event), contentExtractorOpened = false"
      @close="contentExtractorOpened = false")
  ws-contents(
    :mode="'pick'"
    :query="{}"
    @content="contentBookmarkClick")
    template(v-slot:tint=`{item, itemKey}`)
      slot(name="tint" :item="item" :itemKey="itemKey")
    //- template(v-slot:tint=`{item}`)
      div(
        @click="contentBookmarkClick(item)"
        :style=`{
          position: 'absolute', zIndex: 1000,
        }`
        ).row.fit.cursor-pointer
</template>

<script>
export default {
  name: 'nodeEditor_viewAdd_fromContent',
  components: {
    wsContents: () => import('pages/app/ws_contents/index.vue'),
    // fromContentExtract: () => import('./from-content-extract.vue')
  },
  data () {
    return {
      contentBookmark: null,
      contentExtractorOpened: false,
    }
  },
  methods: {
    // contentBookmarkClick (contentBookmark) {
    //   this.$log('contentBookmarkClick', contentBookmark)
    //   let itemInput
    //   if (contentBookmark.contentType === 'IMAGE') {
    //     // emit item as is?
    //     itemInput = {
    //       id: Date.now().toString(),
    //       thumbUrl: contentBookmark.thumbUrl,
    //       outputType: contentBookmark.contentType,
    //       layers: [
    //         {id: Date.now().toString(), contentOid: contentBookmark.oid, figuresAbsolute: [{t: null, points: []}]},
    //       ],
    //       operation: { items: null, operations: null, type: 'CONCAT'},
    //     }
    //     this.$emit('item', itemInput)
    //   }
    //   else if (contentBookmark.contentType === 'VIDEO') {
    //     // open video editor to get the piece...
    //     this.contentBookmark = contentBookmark
    //     this.contentExtractorOpened = true
    //   }
    // }
  }
}
</script>
