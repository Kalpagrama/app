<template lang="pug">
div(style=`minHeight: 300px`).row.full-width.justify-center.items-start.content-start
  //- header
  div(:style=`{minHeight: headerHeight+'px'}`).row.full-width.items-center.justify-center.content-center.bg
    q-btn(v-if="!file" @click="$refs.input.click()" color="primary" style=`height: 50px; borderRadius: 4px`) {{$t('choose_video')}}
    div(v-if="file").row.full-width.justify-center.br
      .col
        .row.fit.items-center.justify-start.q-px-sm
          span {{ file.name }}
      div(style=`height: 70px; width: 70px`).row.items-center.justify-center
        q-btn(round flat icon="clear" @click="videoClear()")
      .row.full-width.bg-red
        node-video(:url="url" :index="0")
        //- video(v-if="url" :src="url" width="100%" height="100%" playsinline preload="auto")
    input(type="file" ref="input" hidden @change="videoChanged" accept="video/mp4,video/x-m4v,video/*")
</template>

<script>
import nodeVideo from 'components/node/node_video'

export default {
  name: 'videoFind__sourceDevice',
  components: {nodeVideo},
  data () {
    return {
      headerHeight: 300,
      file: null,
      url: ''
    }
  },
  methods: {
    videoClear () {
      this.$log('videoClear')
      this.file = null
      this.$tween.to(this, 0.33, {headerHeight: 300})
    },
    async videoChanged ({ target: { validity, files: [file] } }) {
      this.$log('videoChanged', file)
      this.$tween.to(this, 0.33, {headerHeight: 70})
      this.file = file
      this.url = URL.createObjectURL(file)
      this.$log('url', this.url)
      // await this.$wait(5000)
      // let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
      //   client: 'upload',
      //   mutation: gql`
      //     mutation uploadContentFile ($file: Upload!) {
      //       uploadContentFile (file: $file) {
      //         oid
      //       }
      //     }
      //   `,
      //   variables: {
      //     file: file
      //   }
      // })
      // this.$log('file uploaded!', oid)
      // this.$emit('result', file)
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
