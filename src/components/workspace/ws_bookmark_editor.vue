<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px', overflow: 'hidden'}`).column.fit.bg-white
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width
    //- action
    //- div(:style=`{width: '70px'}`).row.full-height.items-center.content-center
    //- name
    .col.full-height
      .row.fit.items-center.content-center.q-px-md
        span(style=`whiteSpace: nowrap`).text-bold {{ bookmarkLocal.name || 'Новая закладка' | cut(36) }}
    //- delete
    div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
      k-menu-popup(v-if="bookmark" :name="'Точно удалить закладку?'" :actions="actions" @action="bookmarkDelete")
        q-btn(round flat icon="delete_outline" color="grey-6")
  //- body
  div(ignore-body-scroll-lock).col.scroll.full-width
    //- wrapper
    .row.full-width.items-start.content-start
      //- url
      .row.full-width.q-px-sm
        .row.full-width.q-px-sm
          span Ссылка
        div(style=`borderRadius: 10px; overflow: hidden; zIndex: 200`).row.full-width
          q-input(ref="urlInput" v-model="bookmarkLocal.url" filled placeholder="Ссылка (обязательно)").full-width
      //- name
      .row.full-width.q-pa-sm
        .row.full-width.q-px-sm
          span Название
        div(style=`borderRadius: 10px; overflow: hidden; zIndex: 200`).row.full-width
          q-input(ref="nameInput" v-model="bookmarkLocal.name" filled placeholder="Название").full-width
      //- tagUids
      .row.full-width
        ws-tags-input(v-if="!loading" ref="tagsInput" :tags="bookmarkLocal.tagUids" @tags="bookmarkLocal.tagUids = $event")
      div(v-if="false").row.full-width.q-pa-sm
        small {{ bookmarkLocal }}
  //- create / update btn
  div(:style=`{height: '80px'}`).row.full-width.items-center.content-center.q-px-sm
    q-btn(
      v-if="!bookmark" color="primary" no-caps :disable="!bookmarkLocal.url" :loading="bookmarkCreating" @click="bookmarkCreate()"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-bold.text-white Создать закладку
    q-btn(
      v-else color="primary" no-caps @click="bookmarkContent()"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-bold.text-white Создать контент
</template>

<script>
import wsTagsInput from './ws_tags_input'

export default {
  name: 'wsBookmarkEditor',
  components: {wsTagsInput},
  props: ['bookmark'],
  data () {
    return {
      loading: true,
      bookmarkLocal: {
        name: '',
        tagUids: [],
        url: ''
      },
      bookmarkCreating: false,
      bookmarkUpdating: false,
      bookmarkDeleting: false,
      actions: [
        {id: 'delete', name: 'Удалить', color: 'red'}
      ]
    }
  },
  methods: {
    async bookmarkCreate () {
      try {
        this.$log('bookmarkCreate start')
        this.bookmarkCreating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/addWSBookmark', this.bookmarkLocal)
        this.$log('bookmarkCreate done', res)
        this.bookmarkCreating = false
        this.$emit('hide')
      } catch (e) {
        this.$log('bookmarkCreate error', e.code, e.message)
        this.bookmarkCreating = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async bookmarkDelete (e) {
      try {
        this.$log('bookmarkDelete start')
        this.bookmarkDeleting = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/deleteWSBookmark', this.bookmarkLocal.uid)
        this.$log('bookmarkDelete done', res)
        this.bookmarkDeleting = false
        this.$emit('hide')
      } catch (e) {
        this.$log('bookmarkDelete error', e.code, e.message)
        this.bookmarkDeleting = false
        this.$q.notify({color: 'red', textColor: 'white', message: e.toString()})
      }
    },
    async bookmarkUpdate () {
      try {
        this.$log('bookmarkUpdate start')
        this.bookmarkUpdating = true
        await this.$wait(600)
        let res = await this.$store.dispatch('workspace/updateWSBookmark', this.bookmarkLocal)
        this.$log('bookmarkUpdate done')
      } catch (error) {
        this.$log('bookmarkUpdate error', error)
      }
    },
    async bookmarkContent () {
      this.$log('bookmarkContent', this.bookmarkLocal)
      this.$emit('hide')
      this.$store.commit('workspace/state', ['bookmarkContent', this.bookmarkLocal])
      this.$nextTick(() => {
        this.$emit('hide')
        this.$store.commit('workspace/state', ['contentEditorDialogOpened', true])
      })
    }
  },
  mounted () {
    this.$log('mounted', this.bookmark)
    if (this.bookmark) this.$set(this, 'bookmarkLocal', JSON.parse(JSON.stringify(this.bookmark)))
    else this.$refs.urlInput.focus()
    this.$nextTick(() => {
      this.loading = false
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.bookmarkUpdate()
  }
}
</script>
