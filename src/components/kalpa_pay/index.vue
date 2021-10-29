<template lang="pug">
  .row
    slot(name="action" :start="start" :content="content")
      q-btn(
        v-if="!$scopedSlots.action"
        round flat no-caps
        :color="paid ? activeColor : inactiveColor"
        icon="paid"
        @click="showDialog = (!paid ? true : false)"
        :loading="loading")
        q-tooltip(dense dark) {{paid ? $t('Paid') : $t('Buy')}}
        q-dialog(
          v-model="showDialog"
          position="standard"
          :maximized="false"
        )
          payanyway-form(
            :amount="12.34"
            :transactionId="Date.now()"
            :description="$t('user') + ':' + $store.getters.currentUser.oid + ':' + $store.getters.currentUser.profile.email + ':' + $t('buy item') + ':' + oid"
            :subscriberId="$store.getters.currentUser.oid + ':' + $store.getters.currentUser.profile.email"
            :params="{userOid:$store.getters.currentUser.oid, itemOid:oid, amount: 12.34}"
            @success="onSuccessPay"
          )
        q-menu(
          v-if="false"
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
                @click="onSuccessPay"
                :label="$t('sberPay')"
                icon='shopping_cart'
                round flat no-caps
              )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import {assert} from 'src/system/common/utils'
import payanywayForm from 'src/components/kalpa_pay/payanyway_form.vue'

export default {
  name: 'kalpaPay',
  props: {
    oid: { type: String },
    item: { type: Object },
    type: { type: String },
    name: { type: String },
    thumbUrl: { type: String },
    isActive: { type: Boolean },
    fields: { type: Object },
    inactiveColor: { type: String, default: 'white' },
    activeColor: { type: String, default: 'green' }
  },
  components: {
    payanywayForm
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
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let { items: [content] } = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
              oid: this.oid
            }
          })
          if (content) this.content = content
        }
      }
    }
  },
  methods: {
    async onSuccessPay () {
      this.$log('onSuccessPay')
      try {
        this.$log('start')
        if (this.$store.getters.isGuest) {
          let authGuard = {
            message: 'Чтобы купить, войдите в аккаунт'
          }
          this.$store.commit('ui/stateSet', ['authGuard', authGuard])
        } else {
          this.loading = true
          await this.$systemUtils.vibrate(500)
          // await this.$wait(500)
          let { items: [content] } = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
              oid: this.oid
            }
          })
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
          await this.$router.push('/workspace/contents')
        }
      } catch (e) {
        this.$log('start error', e)
        this.loading = false
      }
    }
  }
}
</script>
