<style lang="sass">
a
  text-decoration: none !important
  color: white !important
  &:hover
    color: rgb(76,175,80) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  //- author.thumbUrl
  div(
    :style=`{
      width: '60px',
      height: '60px',
    }`
    ).row.items-center.content-center.justify-center
    img(
      draggable="false"
      :src="comment.author.thumbUrl"
      :style=`{
        width: '30px', minWidth: '30px', maxWidth: '30px',
        height: '30px', minHeight: '30px', maxHeight: '30px',
        borderRadius: '50%',
      }`)
  .col
    .row.full-width.q-pt-sm
      //- author and timestamp
      .row.full-width.items-end.content-end
        span(:style=`{maxWidth: '200px', overflow: 'hidden',}`).text-green.q-mr-sm {{ comment.author.name }}
        small.text-grey-8 {{ $date(comment.createdAt) }}
      //- body
      .row.full-width
        p(
          v-if="text"
          v-html="text"
          :style=`{
            whiteSpace: 'pre-wrap',
            color: 'white !important',
            fontSize: '14px',
            textDecotation: 'none !important',
          }`
          ).text-white
      //- TODO: actions
      .row.full-width
  q-btn(v-if="comment.author.oid === $store.getters.currentUser.oid" icon="close", :style=`{ height: '50px', maxWidth: '50px'}` @click="$emit('delete', comment)").col.text-grey
</template>

<script>
export default {
  name: 'commentItem',
  props: ['comment'],
  data () {
    return {
    }
  },
  computed: {
    words () {
      return this.comment.text.split(' ')
    },
    text() {
      return this.urlify(this.comment.text)
    }
  },
  methods: {
    urlify (text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
      })
      // or alternatively
      // return text.replace(urlRegex, '<a href="$1">$1</a>')
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
