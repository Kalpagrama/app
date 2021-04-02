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
      ).row.items-between.content-between.q-pa-sm.b-40
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
  div(
    v-if="showTutorial"
    :style=`{position: 'relative',borderRadius: '10px', overflow: 'hidden'}`).col.full-width
      //- transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      //- v-if="showTutorial"
      q-carousel(
        ref="slides-carousel"
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable animated navigation arrows
        infinite
        :autoplay="10000"
        control-color="white"
        :style=`{
          position: 'absolute',
          zIndex: 10,
        }`).fit
        q-carousel-slide(
          v-for="(s,si) in slides" :key="s.id"
          :name="s.id"
          :style=`{
            position: 'relative',
            zIndex: 10,
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
  div(
    v-if="showTutorial"
    ).row.full-width.justify-center.q-pa-sm
    q-btn(
      flat color="white" no-caps
      :style=`{
        height: '50px',
        maxWidth: '300px',
        minWidth: '300px',
      }`
      @click="$emit('close')")
      span {{$t('Close')}}
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'kalpaWelcome',
  props: {
    config: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      isMounted: false,
      showTutorial: false,
      slide: 'welcome',
      doc: null,
      tutorialInitial: {
        main: false,
        content_first: false,
        node_first: false,
        joint_first: false,
        workspace_first: false,
        workspace_upload: false,
        workspace_article: false,
      }
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
    },
    tutorial () {
      return this.$store.getters.currentUser.profile.tutorial
    }
  },
  watch: {
    config: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('config TO', to)
          this.doc = await this.getDoc(to.id)
          if (!to.useIntro) this.showTutorial = true
        }
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
  async mounted () {
    this.$log('mounted')
    await this.$wait(500)
    this.$nextTick(() => {
      this.isMounted = true
    })
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
    // before
    let userTutorials = this.$store.getters.currentUser.profile.tutorial
    this.$log('userTutorials BEFORE', userTutorials)
    // create userTutorials
    if (typeof this.tutorial !== 'object') {
      this.$log('userTutorials CREATE')
      let tutorialInput = {...this.tutorialInitial, [this.config.id]: true}
      await ObjectApi.update(this.$store.getters.currentUser.oid, 'profile.tutorial', tutorialInput)
    }
    // update userTutorials
    else {
      this.$log('userTutorials UPDATE', this.config.id, true)
      let tutorialInput = {...this.userTutorials, [this.config.id]: true}
      await ObjectApi.update(this.$store.getters.currentUser.oid, 'profile.tutorial', tutorialInput)
    }
    // after
    let userTutorials2 = this.$store.getters.currentUser.profile.tutorial
    this.$log('userTutorials AFTER', userTutorials2)
  }
}
</script>
