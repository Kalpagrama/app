<template lang="pug">
div(
  @click.self="$emit('close')"
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width.items-center.content-center.justify-center
  //- tint
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="isMounted"
      :style=`{
        position: 'absolute', zIndex: -1,
        background: 'rgba(20,20,20,0.8)',
      }`
      @click.self="$emit('close')"
      ).row.fit
  //- preload images
  div(v-if="slides.length > 0").row.full-width
    div(
      v-for="(s,si) in slides" :key="si"
      :style="{position: 'absolute', zIndex: -1, backgroundImage: `url(${s.url})`}")
  //- mini mode
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!showTutorial && doc"
      :style=`{
        width: '300px',
        height: '300px',
        borderRadius: '10px',
      }`
      ).row.items-between.content-between.q-pa-sm.b-40.absolute-center
      .row.full-width
        .row.full-width.q-pa-md
          span(:style=`{fontSize: '22px'}`).text-white.text-bold {{ doc.fields.name }}
        .row.full-width.q-px-md
          div(v-html="doc.fields.description.content[0].content[0].value").text-white
      q-btn(
        flat color="grey-8" no-caps
        @click="$emit('close')")
        span {{ $t('Skip') }}
      q-btn(
        color="green" no-caps
        @click="showTutorial = true").col
        span.text-bold {{ $t('Start') }}
  //- body
  transition(enter-active-class="animated zoomIn" leave-active-class="animated fadeOut")
    div(
      v-if="showTutorial"
      :style=`{position: 'relative',borderRadius: '0px', overflow: 'hidden'}`).col.full-width
        //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        //- v-if="showTutorial"
        q-carousel(
          ref="slides-carousel"
          v-model="slide"
          transition-prev="slide-right"
          transition-next="slide-left"
          swipeable animated navigation arrows
          infinite
          :autoplay="15000"
          control-color="green"
          :style=`{
            position: 'absolute',
            zIndex: 10,
          }`).fit
          template(v-slot:navigation-icon="{ active, btnProps, onClick  }")
            q-btn(v-if="active" size="sm" :icon="btnProps.icon" color="green" flat round dense @click="onClick")
            q-btn(v-else size="sm" :icon="btnProps.icon" color="grey" flat round dense @click="onClick")
          q-carousel-slide(
            v-for="(s,si) in slides" :key="s.id"
            :name="s.id"
            :style=`{
              position: 'relative',
              zIndex: 'auto',
              userSelect: 'none',
            }`
            ).row.fit.items-center.content-center.justify-center.b-30
            img(
              draggable="false"
              :src="s.url"
              :style=`{
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }`
              ).fit
        q-btn(
          flat color="white" no-caps icon="close" dence
          :style=`{
            height: '50px',
            zIndex: 20
          }`
          @click="$emit('close')").absolute-top-right
</template>

<script>
import { ObjectApi } from 'src/api/object'
import cloneDeep from 'lodash/cloneDeep';

export default {
  name: 'kalpaTutorial',
  props: {
    showTutorial: {type: Boolean, default: false},
    tutorialId: {type: String, required: true},
    // config: {
    //   type: Object,
    //   required: true,
    // }
  },
  data () {
    return {
      isMounted: false,
      slide: 'welcome',
      doc: null,
    }
  },
  computed: {
    slides () {
      if (!this.doc || !this.doc.fields.slides) return []
      return this.doc.fields.slides.map(s => {
        return {
          id: s.sys.id,
          url: s.fields.file.url,
        }
      })
    }
  },
  watch: {
    tutorialId: {
      immediate: true,
      async handler(to, from) {
        this.$log('config TO', to)
        this.doc = await this.getDoc(to)
      }
    },
    slides: {
      immediate: true,
      handler (to, from) {
        if (to && to[0]) {
          this.slide = to[0].id
        }
      }
    }
  },
  methods: {
    async getDoc (id) {
      const {items: [doc]} = await this.$contentful.getEntries({
        content_type: 'tutorial',
        'fields.id': id,
      })
      return doc
    },
    prev () {
      this.$log('prev')
      this.$refs['slides-carousel'].previous()
    },
    next () {
      this.$log('next')
      this.$refs['slides-carousel'].next()
    },
  },
  created () {
    this.$log('created')
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(500)
    this.$nextTick(() => {
      this.isMounted = true
    })
  },
  async beforeUnmount () {
    this.$log('beforeDestroy')
    let notice = cloneDeep(this.$store.getters.currentUser.profile.notice)
    notice[this.tutorialId] = true
    await ObjectApi.update(this.$store.getters.currentUser.oid, 'profile.notice', notice)
  }
}
</script>
