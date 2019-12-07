<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{$t('Загрузка с устройства')}}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-content-center
      q-btn(v-if="!uploading" round flat icon="clear" @click="cancel()")
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      input(style=`display: none` ref="fileinput" type="file" @input="fileInputChanged")
      //- q-btn()
</template>

<script>
export default {
  name: 'fragmentFinder__sourceDevice',
  data () {
    return {
      file: null,
      uploading: false
    }
  },
  methods: {
    fileInputChanged (e) {
      this.$logD('fileInputChanged', e)
    },
    upload () {
      try {
        this.$logD('upload start')
        this.uploading = true
        // let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
        //   client: 'uploadApollo',
        //   mutation: gql`
        //     mutation uploadContentFile ($file: Upload!, $length: Float!) {
        //       uploadContentFile (file: $file, length: $length) { oid }
        //     }
        //   `,
        //   variables: {
        //     file: file,
        //     length: length
        //   }
        // })
        // return oid
        this.$logD('upload done')
        this.uploading = false
      } catch (error) {
        this.$logD('upload error', error)
        this.uploading = false
      }
    },
    cancel () {
      this.$logD('cancel')
      if (!this.uploading) {
        this.$emit('hide')
      }
    }
  },
  mounted () {
    this.$logD('mounted')
    this.$refs.fileinput.click()
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
