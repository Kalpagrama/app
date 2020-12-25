<template lang="pug">
  .row.full-width.items-start.content-start
    //- header
    .row.full-width
      q-input(
        v-model="name"
        borderless color="green" dark
      placeholder="Название контента"
        :input-style=`{
        fontWeight: 'bold',
        fontSize: '20px',
        color: 'white',
        paddingLeft: '14px',
      }`
      ).full-width
    //- body: square video
    div(
      :style=`{
      position: 'relative',
      paddingBottom: '100%',
    }`
    ).row.full-width
      content-player(
        v-if="src"
        :contentKalpa="contentKalpa"
        @player="playerLoaded"
        :styles=`{
        position: 'absolute', zIndex: 100,
        height: '100%',
        borderRadius: '10px',
      }`).bg-black
    //- footer
    .row.full-width.q-py-sm
      .col
      q-btn(
        @click="upload()"
        color="green" no-caps
      :loading="uploading") Загрузить
</template>

<script>
import { ContentApi } from 'src/api/content'
import contentPlayer from 'src/components/content_player/index.vue'

export default {
  name: 'contentImporter_fromDeviceVideo',
  props: ['contentFile'],
  components: {contentPlayer},
  data () {
    return {
      name: '',
      src: null,
      file: null,
      uploading: false,
    }
  },
  computed: {
    contentKalpa () {
      return {
        name: '',
        thumbUrl: '',
        url: this.file,
        type: 'BOOK',
        contentSource: 'KALPA',
      }
    }
  },
  watch: {
    contentFile: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('contentFile TO', to)
        if (to) {
          this.src = URL.createObjectURL(to)
          this.file = to
          this.name = to.name
        }
      }
    }
  },
  methods: {
    async upload () {
      try {
        this.$log('upload start')
        this.uploading = true
        await this.$wait(300)
        if (this.name.length < 3) {
          throw new Error('Too short name!')
        }
        if (!this.contentFile) {
          throw new Error('No contentFile!')
        }
        // check duration, frames?
        // this.contentFile.name = this.name
        // const blob = new Blob(this.contentFile)
        // blob.name = this.name
        // this.$log('blob', blob)
        let contentKalpa = await ContentApi.contentCreateFromFile(this.contentFile)
        this.$log('upload contentKalpa', contentKalpa)
        this.$emit('contentKalpa', contentKalpa)
        this.$log('upload done')
        this.uploading = false
      }
      catch (e) {
        this.$log('upload error', e)
        this.uploading = false
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
      }
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.src) {
      URL.revokeObjectURL(this.src)
    }
  },
}
</script>
