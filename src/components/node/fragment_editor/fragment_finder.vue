<template lang="pug">
div(:style=`{minHeight: '74px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.content-center.bg-white
  div(v-if="!videoShow").row.full-width.q-px-sm
    //- find in ws
    q-dialog(ref="findWsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      div(@click.self="$refs.findWsDialog.hide()").row.fit.items-end.content-end.justify-center
        div(
          :style=`{maxHeight: $q.screen.height-60+'px', borderRadius: '10px 10px 0 0',
            overflow: 'hidden', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).column.fit.bg-grey-3
          .col.full-width
            ws-items(ctx="inEditor" :types="['fragments', 'contents']" @itemClick="wsItemClick")
    //- url input
    input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}` accept="video/*")
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(ref="urlInput" v-model="url" color="green" filled placeholder="Paste URL").full-width
        template(v-slot:prepend)
          q-btn(round flat color="green" icon="attach_file" @click="$refs.fileInput.click()")
        template(v-slot:append)
          q-btn(round flat color="green" icon="add" @click="$refs.findWsDialog.show()")
  video(
    v-if="videoShow"
    ref="videoRef" crossorigin="anonymous" autoplay="true" loop="true" playsinline="true" preload="auto"
    :src="videoUrl"
    @loadeddata="videoLoad" @error="videoError"
    :style=`{width: '100%'}`)
</template>

<script>
import { fragments } from 'src/schema/fragments'
import wsItems from 'components/workspace/ws_items'

export default {
  name: 'fragmentFinder',
  components: {wsItems},
  data () {
    return {
      url: '',
      videoUrl: '',
      videoShow: false,
      videoLoaded: false
    }
  },
  methods: {
    wsItemClick (item) {
      this.$log('wsItemClick', item.type)
      switch (item.type) {
        case 'fragment': {
          this.$emit('fragment', item.item)
          break
        }
        case 'content': {
          break
        }
      }
    },
    urlChanged (e) {
      this.$log('urlChanged', e)
    },
    videoLoad (e) {
      this.$log('videoLoad', e)
      let h = this.$refs.videoRef.clientHeight
      let w = this.$refs.videoRef.clientWidth
      this.$log('h/w', h, w)
      this.vidoeLoaded = true
    },
    videoError (e) {
      this.$log('videoError', e)
    },
    async fileChanged (e) {
      this.$log('fileChanged', e)
      let file = e.target.files['0']
      this.$log('file', file)
      let url = URL.createObjectURL(file)
      // this.videoUrl = url
      // this.videoShow = true
      let { data } = await this.$apollo.mutate({
        mutation: gql`
          ${fragments.objectFullFragment}
          mutation uploadContentFileFragmentFinder($file: Upload!, $length: Float!) {
            uploadContentFile(file: $file, length: $length) {
              ...objectFullFragment
            }
          }
        `,
        variables: {
          file: file,
          length: file.size
        },
        client: 'uploadApollo'
      })
      this.$log('data', data)
      // let content = {
      //   oid: false,
      //   type: 'VIDEO',
      //   contentSource: 'DEVICE',
      //   url: url,
      //   urlOriginal: url,
      //   name: file.name,
      //   duration: 0,
      //   thumbUrl: '',
      //   width: 0,
      //   height: 0,
      //   frameUrls: []
      // }
      // let fragment = {
      //   name: '',
      //   content: content,
      //   url: '',
      //   scale: 0,
      //   cuts: []
      // }
      // this.$emit('fragment', fragment)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
