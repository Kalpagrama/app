<style lang="stylus">
.kinput
  border: none
  height: 56px
  padding: 10px
  &:focus
    outline: none
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-grey-3
  div.col.full-width
    k-colls(@coll="coll = $event" :tabs="true" :header="false" :coll="coll" :colls="colls" :style="{height: '100%'}")
      template(v-slot:nodes)
        ws-nodes(@nodeClick="nodeClick" :nodeClickOverride="true")
      template(v-slot:upload)
        .column.fit
          div(:style=`{height: headerHeight+'px'}`).row.full-width.items-end.q-px-sm
            div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
              input(
                ref="inputUrl" type="url" :placeholder="$t('Write URL')" v-model="url"
                @paste="urlPasted"
                @input="urlInput" @change="urlChanged"
                :style=`{height: '60px', width: '100%'}`).kinput
              q-btn(
                v-if="url.length === 0"
                push no-caps color="accent" @click="paste()"
                :style=`{position: 'absolute', right: '8px', top: '12px', borderRadius: '10px'}`)
                span {{$t('Paste')}}
              q-btn(
                v-else
                round flat icon="clear" @click="url = ''"
                :style=`{position: 'absolute', right: '8px', top: '10px'}`)
          .col.full-width.scroll.kscroll
            //- device
            div(v-if="url.length === 0" key="device").row.fit.q-pa-sm
              div(
                :style=`{borderRadius: '10px', overflow: 'hidden'}`
                ).row.full-width.full-height.items-start.justify-center.bg-white.cursor-pointer.q-pa-sm
                input(ref="inputFile" type="file" @change="fileChanged" :style=`{display: 'none'}`)
                q-btn(
                  no-caps outline color="accent" @click="$refs.inputFile.click()"
                  :style=`{height: '60px', borderRadius: '10px'}`).full-width
                  span {{ $t('or Pick from device') }}
            //- youtube, and others
            div(v-if="content").row.fit
              nc-youtube(v-if="content.contentSource === 'YOUTUBE'" :url="url" @relativePoints="relativePointsFound")
</template>

<script>
import wsNodes from 'components/workspace/ws_nodes'
import ncYoutube from './nc_youtube'

export default {
  name: 'fragmentFinder',
  components: {wsNodes, ncYoutube},
  data () {
    return {
      coll: 'upload',
      colls: [
        {id: 'upload', name: 'Upload'},
        {id: 'nodes', name: 'Nodes'}
      ],
      headerHeight: 200,
      url: '',
      file: null,
      content: null
    }
  },
  computed: {
    urlEmpty () {
      return this.url.length === 0
    }
  },
  watch: {
    url: {
      immediate: true,
      async handler (to, from) {
        this.$logD('url CHANGED', to)
        let url = this.urlParse(to)
        if (url) {
          // let {data: {uploadContentUrl}} = await this.$apollo.mutate({
          //   mutation: gql`
          //     mutation nc_uploadContentUrl ($url: String!) {
          //       uploadContentUrl (url: $url, onlyMeta: true) {
          //         oid
          //         type
          //         name
          //       }
          //     }
          //   `,
          //   variables: {
          //     url: url
          //   }
          // })
          // this.$log('uploadContentUrl', uploadContentUrl)
          // this.content = await this.$store.dispatch('objects/get', { oid: uploadContentUrl.oid, fragmentName: 'objectFragment', priority: 0 })
          // this.content.contentSource = 'YOUTUBE'
          // this.$log('content', this.content)
          this.$tween.to(this, 0.3, {headerHeight: 70})
        } else {
          this.$tween.to(this, 0.3, {headerHeight: 200})
          this.$logD('WRONG URL')
        }
      }
    }
  },
  methods: {
    relativePointsFound (points) {
      this.$log('relativePointsFound', points)
      let fragment = {
        uid: 'skdmflksmdf',
        oid: this.content.oid,
        thumbUrl: this.content.thumbUrl,
        relativePoints: points,
        relativeScale: this.content.duration
      }
      this.$log('fragment', fragment)
      this.$emit('fragment', fragment)
    },
    urlParse (url) {
      let res
      try {
        res = new URL(url)
        return res
      } catch (e) {
        this.$logD('urlParse WRONG URL')
        return false
      }
    },
    async urlPasted (e) {
      this.$logD('urlPasted', e)
      await this.$wait(200)
      this.$refs.inputUrl.blur()
    },
    urlInput (e) {
      this.$logD('urlInput', e)
    },
    urlChanged (e) {
      this.$logD('urlChanged', e)
    },
    paste () {
      this.$logD('paste')
      let data = ClipboardEvent.clipboardData
      this.$logD('data', data)
    },
    fileChanged (e) {
      this.$logD('fileChanged', e)
      let files = e.target.files
      this.$logD('typof files', typeof files)
      // TODO: how to handle many files or one, or types
    },
    nodeClick ([n, ni]) {
      this.$logD('nodeClick', n, ni)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
