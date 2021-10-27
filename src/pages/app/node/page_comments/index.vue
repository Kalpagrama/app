<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  // заголовок
  .row.full-width
    q-resize-observer(@resize="$event => headerHeight = $event.height")
    .q-pa-sm.text-h6.text-bold.text-white {{$t('Comments')}} ({{commentsCount}})
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  //- comments
  .row.full-width.justify-center
    tab-list-feed(
      :scrollAreaHeight="height - headerHeight"
      :type="'quasar'"
      :query="query"
      :itemHeightApprox="60"
      :itemActivePersist="false"
      @count="commentsCount = $event").row.full-width
      template(v-slot:externalHeader)
          //- comment input
          div(:style=`{ borderRadius: '10px',}`).row.full-width.items-stretch.content-start.b-35
            q-input(
              v-model="comment"
              autogrow dense borderless dark type="textarea" :resize="false"
              :placeholder="$t('Join the discussion')"
              :input-style=`{
                resize: 'none',
                padding: '10px',
                background: 'rgb(45,45,45)',
                borderRadius: '10px',
              }`
              @keyup.enter.ctrl="commentSend()").col
            q-btn(
              flat color="green" icon="send"
              :loading="commentSending"
              @click="commentSend()")
      template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
        comment-item(:comment="item" :itemState="itemState" :itemIndex="itemIndex" :isActive="isActive" @delete="commentDelete")
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
  props: ['node', 'height'],
  data () {
    return {
      comment: '',
      commentSending: false,
      commentsCount: 0,
      headerHeight: 0
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
  methods: {
    async commentSend () {
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы добавить комментарий, войдите в аккаунт'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
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
    async commentDelete (comment) {
      try {
        this.$log('commentDelete')
        this.commentSending = true
        const res = await ObjectApi.commentDelete(this.node.oid, comment)
        this.$log('commentDelete done')
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
