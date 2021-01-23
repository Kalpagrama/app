<template lang="pug">
.row.items-center.content-center.justify-center
  q-btn(
    @click.native="start"
    round flat dense color="grey-6" icon="get_app"
    :style=`{
      width: '58px',
    }`).full-height
  input(
    ref="inputFile" type="file"
    @input="fileChanged"
    :accept="accept"
    :style=`{display: 'none'}`)
</template>

<script>
export default {
  name: 'wsSearch_contentUploader',
  data () {
    return {
    }
  },
  computed: {
    accept () {
      return 'image/*, video/*, application/epub+zip'
    },
  },
  methods: {
    start (e) {
      this.$log('start', this.$refs.inputFile)
      this.$refs.inputFile.click()
    },
    async fileChanged (e) {
      this.$log('fileChanged', e)
      this.$emit('file', e.target.files[0])
      // this.$emit('file', new Blob(e.target.files[0]))
      e.target.value = ''
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
