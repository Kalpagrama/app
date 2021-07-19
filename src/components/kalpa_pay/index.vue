<template lang="pug">
.row
  slot(name="action" :start="start" :content="content")
  q-btn(
    v-if="!$scopedSlots.action"
    round flat no-caps
    :color="paid ? activeColor : inactiveColor"
    icon="paid"
    :loading="loading")
    q-tooltip(dense dark) {{paid ? $t('Paid') : $t('Buy')}}
    q-menu(
    v-if="!paid"
      dark)
      .row
        img(
          :style=`{
                objectFit: 'cover',
                maxWidth: '100px',
                borderRadius: '10px',
              }`
          :src="thumbUrl"
          )
        .row.full-width
          q-btn(
            @click="start()"
            :label="$t('sberPay')"
            icon='shopping_cart'
            round flat no-caps
          )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import * as assert from 'assert'
import { ContentApi } from 'src/api/content'

export default {
  name: 'kalpaPay',
  props: {
    oid: {type: String},
    type: {type: String},
    name: {type: String},
    thumbUrl: {type: String},
    isActive: {type: Boolean},
    fields: {type: Object},
    inactiveColor: {type: String, default: 'white'},
    activeColor: {type: String, default: 'green'},
  },
  components: {
  },
  data () {
    return {
      showDialog: false,
      content: null,
      loading: false
    }
  },
  computed: {
    paid () {
      return this.content && this.content.paid
    },
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let {items: [content]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: this.oid}})
          if (content) this.content = content
        }
      }
    },
    // content: {
    //   handler (to, from) {
    //     this.$log('content TO', to)
    //     if (to) this.$emit('content', to)
    //   }
    // }
  },
  methods: {
    async start () {
      try {
        this.$log('start')
        if (this.$store.getters.isGuest) {
          let authGuard = {
            message: 'Чтобы купить, войдите в аккаунт.'
          }
          this.$store.commit('ui/stateSet', ['authGuard', authGuard])
        }
        else {
          this.loading = true
          await this.$systemUtils.vibrate(500)
          // await this.$wait(500)
          let {items: [content]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: this.oid}})
          this.$log('start [content]', content)
          if (!content) {
            this.$log('content CREATE')
            let contentInput = {
              type: this.type,
              oid: this.oid,
              name: this.name,
              thumbUrl: this.thumbUrl,
              ...this.fields || {},
              paid: false
            }
            content = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
          }
          assert(content, '!content!!')
          this.$log('start done')
          this.content = content
          // todo веменное решение! Надо переделать так, чтобы этим занимался бэкенд.
          this.content.paid = true
          this.loading = false
          // this.showDialog = true
        }
      }
      catch (e) {
        this.$log('start error', e)
        this.loading = false
      }
    }
  }
}
</script>
