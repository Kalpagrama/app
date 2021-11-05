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
    this.$log('mounted', this.file)
    let contentKalpa = await ContentApi.contentCreateFromFile(this.file)
    this.$log('contentKalpa', contentKalpa)
    let {items: [content]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: contentKalpa.oid}})
    if (!content) { // create content
      let contentInput = {
        type: 'BOOK',
        oid: contentKalpa.oid,
        name: contentKalpa.name,
        thumbUrl: contentKalpa.thumbUrl,
      }
      this.$log('contentInput', contentInput)
      // create
      content = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
      this.$log('content', content)
    }
    // go to this content...
    await this.$router.push('/content/' + contentKalpa.oid)
    // this.$router.push('/workspace/contents')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
