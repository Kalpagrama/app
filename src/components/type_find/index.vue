<template lang="pug">
div(style=`maxWidth: 600px`).column.fit.bg-white
  //- header
  div(style=`height: 74px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-md
    span Choose content
  //- body
  .col.scroll
    div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.content-center.q-px-sm
      h6.q-ma-xs 1.
      span.q-pt-xs Choose type
    div(style=`borderBottom: 1px solid #eee`).row.full-width.items-start.content-start
      div(
        v-for="(t, tkey) in types" :key="tkey" @click="typeClick(t, tkey)"
        style=`height: 150px; minWidth: 150px; width: 150px; borderRight: 1px solid #eee`
        ).col
        .row.fit.items-center.content-center.justify-center.hr.cursor-pointer
          q-icon(:name="t.icon" :color="tkey === type ? t.color : 'grey'" size="90px")
          .row.full-width.justify-center
            span.text-black {{ t.name }}
    div(v-if="type === 'IMAGE'").row.full-width
      div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
        h6.q-ma-xs 2.
        span.q-pt-xs Choose image source
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(v, vi) in types[type].types" :key="v.id"
          :style=`{height: getHeight(types[type].types.length)+'px', borderRight: '1px solid #eee'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{v.name}}
      div(v-if="true").row.full-width
        div(style=`height: 300px`).row.full-width.items-center.justify-center
          span Not implemented, yet
    div(v-else-if="type === 'VIDEO'").row.full-width
      div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
        h6.q-ma-xs 2.
        span.q-pt-xs Choose video source
      div(style=`borderBottom: 1px solid #eee`).row.full-width
        div(v-for="(v, vi) in types[type].types" :key="v.id" @click="typeVideo = v.id"
          :style=`{height: getHeight(types[type].types.length)+'px', borderRight: '1px solid #eee', background: typeVideo === v.id ? 'grey' : 'none'}`).col.hr.cursor-pointer
            .row.fit.items-center.content-center.justify-center
              span {{v.name}}
      div(v-if="typeVideo === 'youtube'" style=`minHeight: 130px`).row.full-width
        div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
          h6.q-ma-xs 3.
          span.q-pt-xs Find video in YouTube
        .row.full-width.q-px-md
          .col
            q-input(v-model="search" filled placeholder="Search").full-width
          q-btn(no-caps style=`height: 56px; borderRadius: 8px; minWidth: 80px` color="primary" @click="searchFind").q-ml-md Find
        div(style=`minHeight: 500px`).row.full-width.q-px-md
          video-find(:search="searchValidated" @video="videoSelected")
      div(v-else-if="typeVideo === 'link'" style=`minHeight: 130px`).row.full-width
        div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
          h6.q-ma-xs 3.
          span.q-pt-xs Paste link to video
        .row.full-width.q-px-md
          .col
            q-input(v-model="link" filled placeholder="Paste link from YouTube (VK, Vimeo soon)").full-width
          q-btn(no-caps style=`height: 56px; borderRadius: 8px; minWidth: 80px` color="primary").q-ml-md Find
      div(v-else-if="typeVideo" ).row.full-width
        div(style=`height: 300px`).row.full-width.items-center.justify-center
          span Not implemented, yet
    div(v-else-if="type === 'BOOK'").row.full-width
      div(style=`height: 300px`).row.full-width.items-center.justify-center
        span Book no implemented, yet
  //- footer
  div(style=`height: 74px; borderTop: 1px solid #eee`).row.full-width.justify-end.items-center.content-center.q-px-md
    q-btn(style=`borderRadius: 8px; height: 50px` no-caps color="primary" outline @click="handleCancel").q-mr-md Cancel
    q-btn(style=`borderRadius: 8px; height: 50px; minWidth: 120px` no-caps color="primary" @click="handleNext") Next
</template>

<script>
import videoFind from 'components/video_find/source_youtube'

export default {
  name: 'typeFind',
  components: {videoFind},
  data () {
    return {
      type: '',
      typeVideo: '',
      typeImage: '',
      typeBook: '',
      types: {
        IMAGE: {
          name: 'Image',
          icon: 'image',
          color: 'green',
          types: [
            {id: 'camera', name: 'From camera'},
            {id: 'device', name: 'From device'},
            {id: 'google', name: 'From google'},
            {id: 'link', name: 'Paste link'},
            {id: 'workspace', name: 'From workspace'}
          ]
        },
        VIDEO: {
          name: 'Video',
          icon: 'fab fa-youtube',
          color: 'red',
          types: [
            {id: 'camera', name: 'From camera'},
            {id: 'device', name: 'From device'},
            {id: 'youtube', name: 'From youtube'},
            {id: 'link', name: 'Paste link'},
            {id: 'workspace', name: 'From workspace'}
          ]
        },
        BOOK: {
          name: 'Book',
          icon: 'format_quote',
          color: 'black',
          types: [
            {id: 'device', name: 'From device'},
            {id: 'link', name: 'From link'},
            {id: 'workspace', name: 'From workspace'}
          ]
        }
      },
      link: '',
      search: '',
      searchValidated: '',
      videos: []
    }
  },
  methods: {
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
      // this.$emit('type', t)
      // this.$emit('close')
    },
    handleNext () {
      this.$log('handleNext')
    },
    handleCancel () {
      this.$log('handleCancel')
    },
    searchFind () {
      this.$log('searchFind')
      this.searchValidated = this.search
    },
    videoSelected (v) {
      this.$log('videoSelected', v)
      this.$emit('result', {type: this.type, data: v})
      this.$emit('close')
    }
  }
}
</script>
