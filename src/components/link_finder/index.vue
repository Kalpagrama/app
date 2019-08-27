<template lang="pug">
.row.full-width
  div(:style=`{height: headerHeight+'px'}`).row.full-width.items-center.content-center.q-px-sm
    q-input(v-model="link" placeholder="Вставьте ссылку" autofocus
      filled @keyup.enter="find()").col
      template(v-slot:append)
        q-btn(v-if="link.length > 0" flat round dense icon="clear" @click="findCancel()" color="primary")
    //- q-btn(color="primary" @click="find()" :loading="loading" style=`height: 56px` no-caps).q-ml-sm {{$t('Найти')}}
    q-btn(color="primary" @click="find()" :loading="loading" style=`height: 56px; width: 56px` no-caps icon="search").q-ml-sm
  div(v-if="mode === 'word'" style=`height: 40px`).row.full-width.justify-center
    div(v-if="mode === 'word'" v-for="s in sources" :key="s.id" @click="sourceClick(s)"
      ).row.cursor-pointer.q-pa-sm.hr
      span {{s.name}}
  div(v-if="mode === 'link'").row.full-width
    .row.full-width.q-px-sm
      div(style=`borderRadius: 4px; overflow: hidden`).row.full-width
        iframe(
          :src="videoLink"
          :style=`{width: '100%', height: width*0.56+'px', objectFit: 'contain !important'}`
          frameborder="0"
          autoplay
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen)
        //- div(v-else).row.fit.bg-grey-3
    //- video actions
    .row.full-width.justify-end.q-my-md.q-px-sm
      q-btn(style=`height: 50px; borderRadius: 4px` flat color="primary" no-caps @click="findCancel()").q-mr-sm {{$t('Отмена')}}
      q-btn(style=`height: 50px; borderRadius: 4px` color="primary" :loading="nexting" @click="videoSelect({})" no-caps) {{$t('Выбрать видео')}}
</template>

<script>
export default {
  name: 'linkFinder',
  props: ['width', 'height', 'nexting'],
  data () {
    return {
      loading: false,
      link: '',
      mode: null,
      modes: ['link', 'word', 'cloud', 'device'],
      headerHeight: 400,
      source: null,
      sources: [
        {id: 'image', name: 'Картинка'},
        {id: 'book', name: 'Книга'},
        {id: 'video', name: 'Видео'},
        {id: 'code', name: 'Код'}
      ]
    }
  },
  computed: {
    videoLink () {
      let id = ''
      let arr = this.link.split('/')
      if (arr[arr.length - 2] === 'embed') {
        id = arr[arr.length - 1]
      } else {
        let s = this.link.split('=')
        id = s[1]
      }
      return `https://www.youtube.com/embed/${id}`
    }
  },
  methods: {
    sourceClick (s) {
      this.$log('sourceClick', s)
      this.source = s
    },
    async find () {
      try {
        this.$log('find start')
        this.loading = true
        await this.$wait(500)
        let link = await this.linkValidate(this.link)
        if (link) {
          this.$log('find LINK', link.host)
          this.mode = 'link'
          switch (link.host) {
            case 'www.youtube.com': {
              this.$log('find YOTUBE')
              break
            }
          }
        } else {
          this.$log('find WORD')
          this.mode = 'word'
        }
        this.$tween.to(this, 0.4, {headerHeight: 70})
        this.$log('find done')
        this.loading = false
      } catch (error) {
        this.$log('find error', error)
        this.loading = false
      }
    },
    findCancel () {
      this.$log('findCancel')
      this.link = ''
      this.mode = null
      this.$tween.to(this, 0.4, {headerHeight: 400})
    },
    linkValidate (link) {
      try {
        // this.$log('linkValidate')
        let l = new URL(link)
        return l
      } catch (e) {
        return false
      }
    },
    videoSelect () {
      this.$log('videoSelect')
      let v = {url: this.link}
      let options = {type: 'VIDEO', source: 'from_link'}
      // TODO: ask really choose this video?
      this.$emit('ready', {...v, ...options})
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
