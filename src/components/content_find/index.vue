<template lang="pug">
div(style=`maxWidth: 600px`).column.fit.bg-white
  //- header
  //- div(style=`height: 74px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-md
  //-   span {{$t('choose_content')}}
  //- body
  .col.scroll
    //- choose type header
    //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.content-center.q-px-sm
    //-   h6.q-ma-xs 1.
    //-   span.q-pt-xs {{$t('choose_type')}}
    //- types
    div(style=`borderBottom: 1px solid #eee`).row.full-width.items-start.content-start
      div(
        v-for="(t, tkey) in types" :key="tkey" @click="typeClick(t, tkey)"
        :style=`{
          height: getHeight(Object.keys(types).length)+'px',
          width: getHeight(Object.keys(types).length)+'px',
          borderRight: '1px solid #eee',
          background: type === tkey ? '#eee' : 'none'}`
        ).col
        .row.fit.items-center.content-center.justify-center.hr.cursor-pointer
          q-icon(:name="t.icon" :color="tkey === type ? t.color : 'grey'" size="90px")
          div(style=`overflow: hidden`).row.full-width.justify-center
            span.text-black {{ t.name }}::{{getHeight(Object.keys(types).length)}}
    //- image
    div(v-if="type === 'IMAGE'").row.full-width
      //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   h6.q-ma-xs 2.
      //-   span.q-pt-xs {{$t('choose_image_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
            div(style=`overflow: hidden`).row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      image-find(:source="source")
    //- video
    div(v-else-if="type === 'VIDEO'").row.full-width
      //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   h6.q-ma-xs 2.
      //-   span.q-pt-xs {{$t('choose_video_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee', background: skey == source ? '#eee' : 'none'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      video-find(:source="source" @ready="handleReady")
    //- book
    div(v-else-if="type === 'BOOK'").row.full-width
      //- div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
      //-   h6.q-ma-xs 2.
      //-   span.q-pt-xs {{$t('choose_book_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      book-find(:source="source")
  //- footer
  div(style=`height: 74px; borderTop: 1px solid #eee`).row.full-width.justify-end.items-center.content-center.q-px-md
    q-btn(style=`borderRadius: 4px; height: 50px` no-caps color="primary" outline @click="handleCancel" :loading="canceling").q-mr-md {{$t('cancel')}}
    q-btn(style=`borderRadius: 4px; height: 50px; minWidth: 120px` no-caps color="primary" @click="handleNext" :loading="nexting") {{$t('next')}}
</template>

<script>
import imageFind from 'components/image_find'
import videoFind from 'components/video_find'
import bookFind from 'components/book_find'

export default {
  name: 'contentFind',
  components: {imageFind, videoFind, bookFind},
  data () {
    return {
      canceling: false,
      nexting: false,
      type: '',
      source: '',
      types: {
        IMAGE: {
          name: 'image',
          icon: 'image',
          color: 'green',
          sources: {
            // camera: {name: 'from_camera'},
            device: {name: 'from_device', implemented: false},
            google: {name: 'from_google', implemented: false},
            link: {name: 'from_link', implemented: true},
            workspace: {name: 'from_workspace', implemented: true}
          }
        },
        VIDEO: {
          name: 'video',
          icon: 'fab fa-youtube',
          color: 'red',
          sources: {
            // camera: {name: 'from_camera'},
            device: {name: 'from_device', implemented: true},
            youtube: {name: 'from_youtube', implemented: true},
            link: {name: 'from_link', implemented: true},
            workspace: {name: 'from_workspace', implemented: false}
          }
        },
        BOOK: {
          name: 'book',
          icon: 'format_quote',
          color: 'black',
          sources: {
            device: {name: 'from_device', implemented: false},
            link: {name: 'from_link', implemented: false},
            workspace: {name: 'from_workspace', implemented: false}
          }
        }
      },
      content: null,
      contents: []
    }
  },
  methods: {
    handleReady (val) {
      this.$log('handleReady', val)
      this.content = val
      // switch case to validate type, source, url, file...
      // to be able to use next
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
      this.type = tkey
      this.source = ''
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
        await this.$wait(2000)
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
          } else if (this.content.source === 'from_link') {
            this.$log('next from_link')
            // TODO:
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
  }
}
</script>
