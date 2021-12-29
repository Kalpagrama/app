<template lang="pug">
div(v-if="contentIsPaid").row
  slot(v-if="!formOnly" name="action" :start="start" :item="item")
    q-btn(
      v-if="!$slots.action"
      round flat no-caps
      :color="paid ? activeColor : inactiveColor"
      icon="paid"
      @click="showDialog = (!paid ? true : false)"
      :loading="loading")
      q-tooltip(dense dark) {{paid ? $t('Paid') : $t('Buy')}}
      q-dialog(
        v-model="showDialog"
        position="standard"
        :maximized="false")
        payanyway-form(:item="item" @successPay="onSuccessPay")
      q-menu( v-if="false" dark)
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
  payanyway-form(v-if="formOnly" :item="item" @successPay="onSuccessPay")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import {assert} from 'src/system/common/utils'
import payanywayForm from 'src/components/kalpa_pay/payanyway_form.vue'

export default {
  name: 'kalpaPay',
  emits: ['successPay'],
  props: {
    item: { type: Object },
    isActive: { type: Boolean, default: true },
    formOnly: { type: Boolean, default: false },
    inactiveColor: { type: String, default: 'grey-3' },
    activeColor: { type: String, default: 'green' }
  },
  components: {
    payanywayForm
  },
  data () {
    return {
      showDialog: false,
      loading: false
    }
  },
  computed: {
    paid () {
      if (!this.item.payInfo.price || this.item.author.oid === this.$store.getters.currentUser.oid) return true // если контент бесплатный либо я - автор
      return this.item.payInfo.paid
    },
    contentIsPaid () {
      return this.item.payInfo.price > 0
    }
  },
  methods: {
    async onSuccessPay () {
      this.$emit('successPay')
      // бэкенд сам добавит в мастерскую в купленное и обновит контент
      // this.loading = true
      // this.loading = false
      await this.$systemUtils.hapticsImpact()
      this.$logT('onSuccessPay')
    }
  },
  mounted () {
    assert(this.item)
    assert(this.item.payInfo)
  }
}
</script>
