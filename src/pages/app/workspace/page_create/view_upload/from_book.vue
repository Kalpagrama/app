<template lang="pug">
.row.full-width.justify-center.q-py-xl
  q-spinner(size="50px" color="green").q-my-xl
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

export default {
  name: 'fromBook',
  props: ['file', 'fileSrc'],
  async mounted () {
    this.$log('mounted')
    let contentKalpa = await ContentApi.contentCreateFromFile(this.file)
    this.$log('contentKalpa', contentKalpa)
    let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
    if (bookmark) {
    }
    // create bookmark
    else {
      let bookmarkInput = {
        type: 'BOOK',
        oid: contentKalpa.oid,
        name: contentKalpa.name,
        thumbUrl: contentKalpa.thumbUrl,
        isSubscribed: true
      }
      this.$log('bookmarkInput', bookmarkInput)
      // create
      bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      this.$log('bookmark', bookmark)
      // subscribe to this bookmark
      if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      // go to this content...
      this.$router.push('/content/' + contentKalpa.oid)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
