<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div( :style=`{ maxWidth: $store.state.ui.pageWidth+'px' }`).row.full-width
    video(
      controls
      :src="fileSrc"
      :style=`{
      }`
      ).full-width
    .row.full-width
      .col
      q-btn(
        @click="uploadContent"
        flat no-caps color="green") {{$t('Upload')}}
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'fromImage',
  props: ['file', 'fileSrc'],
  methods: {
    async uploadContent () {
      this.$log('uploadContent')
      let contentKalpa = await ContentApi.contentCreateFromFile(this.file)
      this.$log('contentKalpa', contentKalpa)
      // check bookmark with contentKalpa.oid
      let {items: [content]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: contentKalpa.oid}})
      if (content) {
      }
      // create bookmark
      else {
        let contentInput = {
          type: ObjectTypeEnum.VIDEO,
          oid: contentKalpa.oid,
          name: '',
          thumbUrl: contentKalpa.thumbUrl,
          paid: false
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
  }
}
</script>
