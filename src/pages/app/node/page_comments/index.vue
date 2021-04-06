<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  //- comment input
  div(
    :style=`{
      minHeight: '60px',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start.b-35
    .col
      q-input(
        v-model="comment"
        borderless dark type="textarea"
        :placeholder="$t('Write comment')"
        :input-style=`{
          padding: '10px',
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          height: '60px',
        }`
        @keyup.enter="commentSend()"
        ).full-width
    q-btn(
      flat color="green" icon="send"
      :loading="commentSending"
      :style=`{
        height: '60px',
        width: '60px',
      }`
      @click="commentSend()")
  //- comments
  .row.full-width.justify-center.q-pt-sm
    list-feed(
      :query="query"
      :itemsPerPage="24"
      :itemMiddlePersist="false"
      :itemsMax="100"
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`)
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        comment-item(:comment="item" :isActive="isActive")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'
import commentItem from './comment_item.vue'

export default {
  name: 'pageComments',
  components: {
    commentItem,
  },
  props: ['node'],
  data () {
    return {
      comment: '',
      commentSending: false,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_COMMENTS,
          oidSphere: this.node.oid
        }
      }
    }
  },
  watch: {
    node: {
      immediate: true,
      async handler (to, from) {
        this.$log('node TO', to)
      }
    }
  },
  methods: {
    async commentSend () {
      try {
        this.$log('commentSend')
        this.commentSending = true
        // checks
        if (this.comment.length === 0) throw new Error(this.$t('Empty comment!'))
        const commentInput = this.comment
        this.comment = ''
        const comment = await ObjectApi.commentCreate(this.node.oid, commentInput)
        // this.comment = ''
        this.$log('commentSend comment', comment)
        this.$log('commentSend done')
        // this.comment = ''
        this.commentSending = false
      }
      catch (e) {
        this.$log('commentSend error', e)
        this.commentSending = false
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
      }
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
