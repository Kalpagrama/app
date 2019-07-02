<template lang="pug">
div(style=`maxWidth: 600px`).column.fit.bg-white
  //- header
  //- div(style=`height: 74px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-md
  //-   span {{$t('choose_content')}}
  //- body
  .col.scroll
    //- choose type header
    div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.content-center.q-px-sm
      h6.q-ma-xs 1.
      span.q-pt-xs {{$t('choose_type')}}
    //- types
    div(style=`borderBottom: 1px solid #eee`).row.full-width.items-start.content-start
      div(
        v-for="(t, tkey) in types" :key="tkey" @click="typeClick(t, tkey)"
        :style=`{height: getHeight(Object.keys(types).length)+'px', minWidth: '150px', width: '150px', borderRight: '1px solid #eee',
          background: type === tkey ? '#eee' : 'none'}`
        ).col
        .row.fit.items-center.content-center.justify-center.hr.cursor-pointer
          q-icon(:name="t.icon" :color="tkey === type ? t.color : 'grey'" size="90px")
          .row.full-width.justify-center
            span.text-black {{ t.name }}
    //- image
    div(v-if="type === 'IMAGE'").row.full-width
      div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
        h6.q-ma-xs 2.
        span.q-pt-xs {{$t('choose_image_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      image-find(:source="source")
    //- video
    div(v-else-if="type === 'VIDEO'").row.full-width
      div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
        h6.q-ma-xs 2.
        span.q-pt-xs {{$t('choose_video_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee', background: skey == source ? '#eee' : 'none'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      video-find(:source="source" @content="contentSelected")
    //- book
    div(v-else-if="type === 'BOOK'").row.full-width
      div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
        h6.q-ma-xs 2.
        span.q-pt-xs {{$t('choose_book_source')}}
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(s, skey) in types[type].sources" :key="skey" @click="source = skey"
          :style=`{height: '100px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{ s.name }}
      book-find(:source="source")
  //- footer
  div(style=`height: 74px; borderTop: 1px solid #eee`).row.full-width.justify-end.items-center.content-center.q-px-md
    q-btn(style=`borderRadius: 4px; height: 50px` no-caps color="primary" outline @click="handleCancel").q-mr-md {{$t('cancel')}}
    q-btn(style=`borderRadius: 4px; height: 50px; minWidth: 120px` no-caps color="primary" @click="handleNext") {{$t('next')}}
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
      type: '',
      source: '',
      types: {
        IMAGE: {
          name: 'image',
          icon: 'image',
          color: 'green',
          sources: {
            camera: {name: 'from_camera'},
            device: {name: 'from_device'},
            google: {name: 'from_google'},
            link: {name: 'paste_link'},
            workspace: {name: 'from_workspace'}
          }
        },
        VIDEO: {
          name: 'video',
          icon: 'fab fa-youtube',
          color: 'red',
          sources: {
            camera: {name: 'from_camera'},
            device: {name: 'from_device'},
            youtube: {name: 'from_youtube'},
            link: {name: 'paste_link'},
            workspace: {name: 'from_workspace'}
          }
        },
        BOOK: {
          name: 'book',
          icon: 'format_quote',
          color: 'black',
          sources: {
            device: {name: 'from_device'},
            link: {name: 'from_link'},
            workspace: {name: 'from_workspace'}
          }
        }
      },
      link: '',
      search: '',
      searchValidated: '',
      videos: []
    }
  },
  methods: {
    contentSelected (val) {
      this.$log('contentSelected')
    },
    getHeight (l) {
      let w = this.$q.screen.width
      if (w > 600) {
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
    handleNext () {
      this.$log('handleNext')
    },
    handleCancel () {
      this.$log('handleCancel')
      this.$emit('close')
    }
  }
}
</script>
