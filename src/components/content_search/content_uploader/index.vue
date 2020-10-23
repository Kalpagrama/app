<template lang="pug">
.row.items-center.content-center.justify-center
  q-btn(
    @click.native="start()"
    round flat dense color="grey-4" icon="add"
    :style=`{
      width: '42px',
    }`).full-height
  input(
    ref="inputFile" type="file"
    @input="fileChanged"
    accept="image/*"
    :style=`{display: 'none',}`)
</template>

<script>
export default {
  name: 'contentSearch_contentUploader',
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
      this.$emit('file', this.file)
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
