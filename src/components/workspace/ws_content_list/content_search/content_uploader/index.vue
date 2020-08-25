<template lang="pug">
div().row.items-center.content-center
  q-btn(
    @click="start()"
    round flat dense color="grey-2" icon="attach_file"
    :style=`{
    }`).full-height.q-px-sm
  input(
    ref="inputFile" type="file"
    @input="fileChanged"
    accept="image/*"
    :style=`{display: 'none',}`
    )
</template>

<script>
import { ContentApi } from 'src/api/content'

// TODO: go to this type of content of change it before upload...
// prepare video,image,book,web BEFORE UPLOAD TO SERVER
// set name, description, make adjustments, crop, filter?

export default {
  name: 'wsContentList_contentSearch_contentUploader',
  data () {
    return {
      file: null,
    }
  },
  methods: {
    start () {
      this.$log('start', this.$refs.inputFile)
      this.$refs.inputFile.click()
    },
    async fileChanged (e) {
      this.$log('fileChanged', e)
      this.file = e.target.files[0]
      // this.avatarUrl = URL.createObjectURL(this.avatarFile)
      let content = await ContentApi.contentCreateFromFile(this.file)
      this.$log('content', content)
      // add content to ws...
      this.$emit('content', content)
    },
  },
  // mounted () {
  //   this.$log('mounted')
  // }
}
</script>
