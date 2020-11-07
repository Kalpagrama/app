<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pt-sm
  //- slot for top-left, top-right shit
  q-page-sticky(
    expand position="top"
    :style=`{}`
    ).row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      div(
        :style=`{
          width: '60px',
        }`).row
        slot(name="top-left")
  q-page-sticky(
    expand position="bottom"
    :style=`{
      zIndex: 1000
    }`).b-30
    .row.full-width
      slot(name="bottom")
  div(
    :style=`{
      maxWidth: 770+'px',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`).row.full-width.justify-center.q-pt-md.q-pb-xl
    div(:style=`{maxWidth: '600px',}`).row.full-width.items-start.content-start.q-px-md
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm {{ contentKalpa.name }}
      .row.full-width.q-py-md
        .row.full-width
          q-btn(
            v-if="contentKalpa.contentSource !== 'KALPA'"
            @click="gotToOriginal"
            icon="fab fa-youtube" align="left"
            color="green" outline no-caps
            ).col
            span(:style=`{fontSize: '15px'}`).q-mx-sm в источник
          kalpa-bookmark(
            v-if="contentKalpa"
            :oid="contentKalpa.oid"
            :type="contentKalpa.type"
            :name="contentKalpa.name"
            :thumbUrl="contentKalpa.thumbUrl"
            :isActive="true"
            inactiveColor="grey-8"
            :fields=`{contentType: contentKalpa.type}`
            @bookmark="$event => $emit('bookmark', $event)")
          kalpa-share(
            type="content" :item="contentKalpa")
          q-btn(
            round flat color="grey-8" icon="more_vert")
            q-popup-proxy(
              maximized position="bottom" dark
              cover anchor="top right" self="top right").b-40
              div(
                :style=`{
                  borderRadius: '10px',
                }`
                ).row.full-width.items-start.content-start.b-40
                q-btn(
                  @click="a.cb()"
                  v-for="(a,akey) in actions" :key="akey"
                  flat no-caps
                  :color="a.color || 'white'"
                  :style=`{height: '50px',}`).full-width
                  span.text-bold {{ a.name }}
      //- spheres
      //- div(
        v-if="contentBookmark"
        ).row.full-width.q-py-sm
        .row.full-width.q-pa-sm
          span.text-white.text-bold {{$t('Spheres', 'Сферы')}}
        ws-sphere-editor(
          :item="contentBookmark"
          :style=`{borderRadius: '10px',}`
          ).b-40
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'ContentExplorer_video_viewDetails',
  components: {},
  props: ['contentKalpa', 'contentBookmark'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
      sphereEditing: false,
    }
  },
  computed: {
    actions () {
      return {
        share: {
          name: 'Поделиться',
          cb: () => {
            this.$log('share...')
          }
        },
        report: {
          name: 'Пожаловаться',
          color: 'red',
          cb: () => {
            this.$log('report...')
          }
        },
        // delete: {
        //   name: 'Удалить',
        //   color: 'red',
        //   cb: () => {
        //     this.$log('delete...')
        //   }
        // }
      }
    }
  },
  methods: {
    gotToOriginal () {
      this.$log('gotToOriginal')
      if (this.contentKalpa.contentSource === 'YOUTUBE') {
        let arr = this.contentKalpa.url.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.contentKalpa.url)
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$emit('figures', [])
  }
}
</script>
