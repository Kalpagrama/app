<template lang="pug">
div(
  :style=`{
    minHeight: '500px',
    maxWidth: $q.screen.xs ? '100%' : '400px',
    borderRadius: $q.screen.xs ? '0px' : '10px',
  }`
  ).column.full-width.items-start.content-start.b-30.q-pa-md
  .col.full-width.scroll
    //- thumbUrl(s) and close btn
    .row.full-width.items-start.content-start
      img(
        draggable="false"
        :src="bookmark.thumbUrl"
        :style=`{
          height: '100px',
          maxWidth: '200px',
          borderRadius: '10px',
        }`)
      .col
      q-btn(
        @click="$emit('close')"
        round flat color="grey-8" icon="clear")
    //- name and type
    .row.full-width.q-pa-sm
      span.text-white {{ bookmark.name }}
      .row.full-width
        small.text-grey-7 {{ bookmarkMeta.type }}
      .row.full-width
        small.text-grey-7.q-mr-xs Добавлено: {{ $date(bookmark.createdAt, 'DD.MM.YYYY') }}
      .row.full-width.q-py-xs.q-mt-md
        q-btn(
          :to="bookmarkMeta.link"
          flat dense color="grey-7" icon="launch" no-caps
          :style=`{
            marginLeft: '-8px',
          }`)
          span.q-mx-xs Перейти
      .row.full-width.q-py-xs
        q-btn(
          @click="bookmarkSubscribeToggle()"
          flat color="red" dense no-caps icon="notifications_off"
          :style=`{
            marginLeft: '-8px',
          }`)
          span.q-mx-xs Не получать уведомления
  //- footer: delete
  .row.full-width.justify-start
    q-btn(
      @click="bookmarkDelete()"
      flat dense color="red" no-caps
      ).q-px-sm Удалить закладку
</template>

<script>
export default {
  name: 'bookmarkEditor',
  props: {
    bookmark: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
    }
  },
  computed: {
    bookmarkMeta () {
      if (['VIDEO', 'IMAGE', 'BOOK'].includes(this.bookmark.type)) {
        let typesNames = {
          VIDEO: 'Видео',
          IMAGE: 'Изображение',
          BOOK: 'Книга'
        }
        return {
          link: '/content/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: typesNames[this.bookmark.type]
        }
      }
      else if (this.bookmark.type === 'NODE') {
        return {
          link: '/node/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else if (this.bookmark.type === 'SPHERE') {
        return {
          link: '/sphere/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else if (this.bookmark.type === 'JOINT') {
        return {
          link: '/joint/' + this.bookmark.oid,
          name: this.bookmark.name || 'Связь',
          type: null
        }
      }
      else if (this.bookmark.type === 'USER') {
        return {
          link: '/user/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else {
        return {
          link: '/workspace/bookmarks',
          name: null,
          type: null,
        }
      }
    },
  },
  methods: {
    bookmarkSubscribeToggle () {
      this.$log('bookmarkSubscribeToggle')
      // this.following = await UserApi.isSubscribed(to.oid)
    },
    async bookmarkDelete () {
      this.$log('bookmarkDelete')
      await this.bookmark.remove(true)
      this.$emit('close')
    },
    bookmarkLaunch () {
      this.$log('bookmarkLaunch')
      this.$router.push(this.bookmarkMeta.link)
    },
  }
}
</script>
