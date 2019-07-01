<template lang="pug">
div(style=`minHeight: 300px`).row.full-width.justify-center.items-center
  q-btn(@click="$refs.input.click()") {{$t('choose_video')}}
  //- accept="video/mp4,video/x-m4v,video/*"
  input(type="file" ref="input" hidden @change="videoChanged")
</template>

<script>
export default {
  name: 'videoFind__sourceDevice',
  data () {
    return {
    }
  },
  methods: {
    async videoChanged ({ target: { validity, files: [file] } }) {
      this.$log('videoChanged', file)
      await this.$wait(5000)
      let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentFile ($file: Upload!) {
            uploadContentFile (file: $file) {
              oid
            }
          }
        `,
        variables: {
          file: file
        }
      })
      this.$log('file uploaded!', oid)
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: define it cordova or not to implement file upload from device
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
