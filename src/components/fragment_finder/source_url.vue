<template lang="pug">
.column.fit.bg-white
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width
    //- header
    div(:style=`{height: '70px'}`).row.full-width
      .col.full-height
        .row.fit.items-center.justify-start.q-px-md
          span.text-bold Upload by URL
      div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center.q-px-md
        q-btn(round flat icon="clear" @click="$emit('hide')")
    //- header input
    div(:style=`{minHeight: height+'px'}`).row.full-width.items-end.q-px-sm
      div(:style=`{height: '56px', borderRadius: '10px', overflow: 'hidden', zIndex: 300}`).row.full-width
        .row.full-width
          q-input(ref="inputUrl" v-model="input" filled placeholder="Вставьте ссылку" @keydown.enter="inputEnterHandle" @input="inputHandle" @focus="inputFocusHandle" @blur="inputBlurHandle").full-width
            template(v-slot:append)
              q-btn(v-if="input.length > 0" round flat icon="clear" @click="inputClear()")
  //- body
  .col.scroll.full-width
    .row.full-width.items-start.content-start
      div(v-show="!inputFocused && input.length === 0").row.full-width.q-pa-sm
        q-btn(color="grey-7" outline style=`height: 50px; borderRadius: 10px` no-caps @click="inputBuffer()").full-width
          span Вставить из буфера обмена
      div(v-show="inputValid").row.full-width.q-px-sm
        div(:style=`{position: 'relative', paddingTop: '100%', borderRadius: '10px', overflow: 'hidden', zIndex: 1000}`
          ).row.full-width.q-my-sm.bg-grey-3
          iframe(
            v-if="inputUrl" @load="iframeLoaded"
            :style=`{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', border: 'none'}`
            :src="inputUrl")
          div(v-if="!iframeReady" :style=`{position: 'absolute', zIndex: 1000, top: 0, left: 0}`).row.fit.items-center.justify-center
            q-spinner(:thickness="4" size="50px" color="primary")
  //- footer
  div(v-if="inputUrl" :style=`{height: '70px'}`).row.full-width.q-px-sm
    q-btn(color="primary" style=`height: 60px; borderRadius: 10px` no-caps @click="upload()"
      :disable="!iframeReady"
      :loading="uploading" :percentage="progress ? progress.progress : 0").full-width
      span.text-white.text-bold {{ `Загрузить` }}
</template>

<script>
export default {
  name: 'contentFinder__sourceUrl',
  props: ['source', 'progress'],
  data () {
    return {
      url: null,
      input: '',
      inputUrl: undefined,
      inputValid: false,
      inputFocused: false,
      inputBlured: false,
      items: [],
      height: 130,
      uploading: false,
      iframeReady: false
    }
  },
  watch: {
    url: {
      handler (to, from) {
        this.$log('url CHANGED', to)
        if (to) {
          this.inputValid = true
          switch (to.host) {
            case 'www.youtu.be':
            case 'youtu.be':
            case 'www.youtube.com':
            case 'youtube.com': {
              this.$log('youtube.com')
              let regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
              let match = to.href.match(regExp)
              if (match && match[1] && match[1].length === 11) {
                this.inputUrl = `https://www.youtube.com/embed/${match[1]}`
              }
              break
            }
          }
        } else {
          this.inputValid = false
          this.inputUrl = undefined
        }
      }
    }
  },
  methods: {
    iframeLoaded () {
      this.$log('iframeLoaded')
      this.iframeReady = true
    },
    inputEnterHandle () {
      this.$log('inputEnterHandle')
    },
    inputHandle (e) {
      try {
        this.url = new URL(e)
      } catch (e) {
        this.inputValid = false
      }
    },
    inputFocusHandle (e) {
      this.$log('inputFocused')
      this.inputFocused = true
      this.inputBlured = false
      this.$tween.to(this, 0.5, {height: 70})
    },
    inputBlurHandle (e) {
      this.$log('inputBlured')
      this.inputFocused = false
      this.inputBlured = true
      if (this.input.length === 0) {
        this.$tween.to(this, 0.5, {height: 130})
      }
    },
    inputBuffer () {
      this.$log('inputBuffer')
      this.$refs.inputUrl.focus()
      if (navigator && navigator.clipboard) {
        navigator.clipboard.readText().then(text => {
          this.$log('text', text)
          this.input = text
          this.inputHandle(text)
        })
      }
    },
    inputClear () {
      this.$log('inputClear')
      this.input = ''
      this.inputValid = false
      this.inputUrl = undefined
      this.iframeReady = false
    },
    async upload () {
      try {
        this.$log('upload start')
        this.uploading = true
        this.$emit('uploading', true)
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
            url: this.inputUrl
          }
        })
        this.$log('upload done', oid)
        this.uploading = false
        this.inputClear()
        this.$emit('oid', oid)
        this.$emit('hide')
      } catch (e) {
        this.$log('upload error', e)
        this.uploading = false
        this.$emit('uploading', false)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: uploading progress...
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // close uploading connection ws
  }
}
</script>
