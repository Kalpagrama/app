<template lang="pug">
div(style=`maxWidth: 600px`).column.fit.bg-white
  q-resize-observer(@resize="onResize")
  div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-pl-md
    span Найти видео по ссылке
    .col
    //- //- span Find
    //- div(v-if="type" style=`height: 60px; width: 50px`).row.items-center.justify-center
    //-   q-icon(v-if="type" :name="type.icon" :color="type.color" size="40px")
    //- span(v-if="source") from {{source}}
    //- .col.full-height
    //-   div(v-if="type && source").row.fit.justify-end.items-center.q-px-sm
    //-     q-btn(v-if="type && source" outline dense color="primary" no-caps @click="returnToTypeChoose()" icon="keyboard_arrow_left").q-px-sm {{$t('change_type')}}
    //-   div(v-else).row.fit.items-center.q-px-sm
    //-     span.q-mr-sm Choose
    //-     span(v-if="!type").q-mr-sm type &
    //-     span(v-if="!source") source
    div(v-if="!type && !source" style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(flat round icon="clear" @click="$emit('close')")
  //- body
  .col
    .column.fit
      //- link
      //- .col
      link-finder(:width="width" :height="height" @ready="handleReady" :nexting="nexting")
      //- source-link
      //- types
      //- div(:style=`{borderTop: '1px solid #eee', borderBottom: '1px solid #eee', maxHeight: typesMaxHeight+'px'}`).row.full-width.items-start.content-start.types-wrapper
      //-   div(
      //-     v-for="(t, tkey) in types" :key="tkey" @click="typeClick(t, tkey)"
      //-     :style=`{
      //-       height: getHeight(Object.keys(types).length)+'px',
      //-       width: getHeight(Object.keys(types).length)+'px',
      //-       borderRight: '1px solid #eee',
      //-       background: tkey === typeKey ? '#eee' : 'none'}`
      //-     ).col
      //-     .row.fit.items-center.content-center.justify-center.hr.cursor-pointer
      //-       q-icon(:name="t.icon" :color="tkey === typeKey ? t.color : 'grey'" size="90px")
      //-       div(style=`overflow: hidden`).row.full-width.justify-center
      //-         span.text-black {{ $t(t.name) }}
      //- image
      //- div(v-if="typeKey === 'IMAGE'" style=`overflow: hidden`).row.full-width.types-wrapper
      //-   //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   //-   h6.q-ma-xs 2.
      //-   //-   span.q-pt-xs {{$t('choose_image_source')}}
      //-   div(style=`borderBottom: 1px solid #eee`).row.full-width
      //-     div(v-for="(s, skey) in types[typeKey].sources" :key="skey" @click="source = skey"
      //-       :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
      //-         div(style=`overflow: hidden`).row.fit.items-center.content-center.justify-center
      //-           span {{ s.name }}
      //- video
      //- div(v-else-if="typeKey === 'VIDEO'" style=`overflow: hidden`).row.full-width.types-wrapper
      //-   //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   //-   h6.q-ma-xs 2.
      //-   //-   span.q-pt-xs {{$t('choose_video_source')}}
      //-   div(style=`borderBottom: 1px solid #eee`).row.full-width
      //-     div(v-for="(s, skey) in types[typeKey].sources" :key="skey" @click="source = skey"
      //-       :style=`{height: '100px', borderRight: '1px solid #eee', background: skey == source ? '#eee' : 'none'}`).col.hr.cursor-pointer
      //-         .row.fit.items-center.content-center.justify-center
      //-           span {{ s.name }}
      //- book
      //- div(v-else-if="typeKey === 'BOOK'" style=`overflow: hidden`).row.full-width.types-wrapper
      //-   //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   //-   h6.q-ma-xs 2.
      //-   //-   span.q-pt-xs {{$t('choose_book_source')}}
      //-   div(style=`borderBottom: 1px solid #eee`).row.full-width
      //-     div(v-for="(s, skey) in types[typeKey].sources" :key="skey" @click="source = skey"
      //-       :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
      //-         .row.fit.items-center.content-center.justify-center
      //-           span {{ s.name }}
      //- .col
      //-   image-find(v-if="typeKey === 'IMAGE' && source" :source="source")
      //-   video-find(v-if="typeKey === 'VIDEO' && source" :source="source" @ready="handleReady")
      //-     template(v-slot:progress)
      //-       div(v-if="nexting" style=`position: absolute; zIndex: 100; opacity: 0.9`).row.fit.items-start.content-start.justify-center.bg-white
      //-         div(v-if="progress" style=`height: 500px`).row.full-width.justify-center.items-center.content-center
      //-           q-spinner(:thickness="2" color="primary" size="50px")
      //-           .row.full-width.justify-center.q-py-sm
      //-             small {{$t('loading')}}
      //-           .row.full-width.q-px-md
      //-             q-linear-progress(:value="progress.progress/100" class="q-mt-md" color="primary" stripe rounded style="height: 20px").full-width
      //-   book-find(v-if="typeKey === 'BOOK' && source" :source="source")
</template>

<script>
import imageFinder from 'components/image_finder'
import videoFinder from 'components/video_finder'
import bookFinder from 'components/book_finder'
import linkFinder from 'components/link_finder'
import sourceLink from 'components/video_finder/source_link'

export default {
  name: 'contentFinder',
  components: {imageFinder, videoFinder, bookFinder, linkFinder, sourceLink},
  data () {
    return {
      width: 400,
      height: 600,
      canceling: false,
      nexting: false,
      type: null,
      typeKey: null,
      source: null,
      types: {
        IMAGE: {
          name: 'image',
          icon: 'panorama',
          color: 'green',
          sources: {
            device: {name: 'from_device', implemented: false},
            google: {name: 'from_google', implemented: false},
            link: {name: 'from_link', implemented: true},
            // workspace: {name: 'from_workspace', implemented: true}
          }
        },
        VIDEO: {
          name: 'video',
          icon: 'movie_creation',
          color: 'red',
          sources: {
            device: {name: 'from_device', implemented: true},
            youtube: {name: 'from_youtube', icon: 'fab fa-youtube', implemented: true},
            link: {name: 'from_link', implemented: true},
            // workspace: {name: 'from_workspace', implemented: false}
          }
        },
        BOOK: {
          name: 'book',
          icon: 'format_quote',
          color: 'black',
          sources: {
            device: {name: 'from_device', implemented: false},
            link: {name: 'from_link', implemented: false},
            litres: {name: 'from_litres', implemented: false},
            // workspace: {name: 'from_workspace', implemented: false}
          }
        }
      },
      typesMaxHeight: 400,
      content: null,
      progress: null
    }
  },
  watch: {
    type: {
      handler (to, from) {
        this.$log('type CHANGED', to)
        // what to do here?
      }
    },
    source: {
      handler (to, from) {
        this.$log('source CHANGED', to)
        if (to) {
          this.$tween.to('.types-wrapper', 0.33, {maxHeight: 0, opacity: 0, display: 'none'})
        }
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      this.height = e.height
    },
    handleReady (val) {
      this.$log('handleReady', val)
      this.content = val
      this.handleNext()
    },
    getHeight (l) {
      let w = this.$q.screen.width
      if (w >= 600) {
        return 600 / l
      } else {
        return w / l
      }
    },
    typeClick (t, tkey) {
      this.$log('typeClick', t)
      this.typeKey = tkey
      this.type = t
      this.source = ''
    },
    returnToTypeChoose () {
      this.$log('returnToTypeChoose')
      this.typeKey = null
      this.type = null
      this.content = null
      this.source = null
      this.$tween.to('.types-wrapper', 0.33, {maxHeight: 400, opacity: 1, display: 'flex'})
    },
    image () {
      this.$log('imageSelected')
    },
    videoSelected () {
      this.$log('videoSelected')
    },
    bookSelected () {
      this.$log('bookSelected')
    },
    async fileUpload (file) {
      this.$log('fileUpload')
      let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentFile ($file: Upload!) {
            uploadContentFile (file: $file) {
              oid
              type
            }
          }
        `,
        variables: {
          file: file
        }
      })
      return oid
    },
    async urlUpload (url) {
      this.$log('urlUpload')
      let {data: {uploadContentUrl: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentUrl ($url: String!) {
            uploadContentUrl(url: $url) {
              oid
              type
            }
          }
        `,
        variables: {
          url: url
        }
      })
      return oid
    },
    async handleNext () {
      try {
        this.$log('handleNext start!')
        this.$log('handleNext content', this.content)
        this.nexting = true
        // await this.$wait(2000)
        if (this.content.type === 'VIDEO') {
          this.$log('next VIDEO')
          if (this.content.source === 'from_device') {
            this.$log('next from_device')
            if (!this.content.file) throw new Error('No File in content!')
            let oid = await this.fileUpload(this.content.file)
            this.$log('handleNext done!')
            this.nexting = false
            this.$emit('ready', {type: 'VIDEO', source: 'from_device', oid: oid})
            this.$emit('close')
          } else if (this.content.source === 'from_youtube') {
            this.$log('next from_youtube')
            if (!this.content.url) throw new Error('No url in content!')
            let oid = await this.urlUpload(this.content.url)
            this.$emit('ready', {type: 'VIDEO', source: 'from_youtube', oid: oid})
            this.$emit('close')
            this.nexting = false
          } else if (this.content.source === 'from_link') {
            this.$log('next from_link', this.content)
            if (!this.content.url) throw new Error('No url in content!')
            let oid = await this.urlUpload(this.content.url)
            this.$emit('ready', {type: 'VIDEO', source: 'from_link', oid: oid})
            this.$emit('close')
          } else if (this.content.source === 'from_workspace') {
            this.$log('next from_workspace')
            // TODO:
          }
        } else if (this.content.type === 'IMAGE') {
          this.$log('next IMAGE')
          // TODO:
        } else if (this.content.type === 'BOOK') {
          this.$log('next BOOK')
          // TODO:
        }
      } catch (e) {
        this.$log('handleNext error', e)
        this.nexting = false
        this.$q.notify({color: 'red', colorText: 'white', message: `Error ${e.toString()}`})
      }
    },
    handleCancel () {
      this.$log('handleCancel')
      // TODO: save content to where? to what cache?
      this.$emit('close')
    }
  },
  mounted () {
    this.$log('======= mounted')
    // get clipboard
    // navigator.clipboard.readText().then(clipText => {
    //   this.$log('clipText', clipText)
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$emit('close')
  }
}
</script>
