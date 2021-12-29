<template lang="pug">
div(v-if="!$store.getters.isGuest" :style=`{
             border: "grey",
             borderStyle: 'solid',
             borderWidth: '2px',
             borderRadius: '15px',
             overflow: 'hidden',
    }`).b-30
  //q-btn(label="test").text-white
  div(id="payment-form")
</template>

<script>

import { assert } from 'src/system/common/utils'
import { LangEnum } from 'src/system/common/enums'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

export default {
  name: 'payanywayForm',
  emits: ['successPay'],
  props: ['item'],
  async mounted () {
    this.$logT('this.item=', this.item)
    assert(this.item)
    assert(this.item.name)
    assert(this.item.payInfo)
    assert(!this.item.payInfo.paid)
    // if (!this.item.payInfo.paid) this.$logW('TODO!!!! !this.item.payInfo.paid')
    assert(this.item.payInfo.price > 0)
    if (this.$store.getters.isGuest) {
      let authGuard = {
        message: 'Чтобы купить, войдите в аккаунт'
      }
      this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      return
    }
    assert(this.$store.getters.currentUser && this.$store.getters.currentUser.oid)
    let assistantScript = document.createElement('script')
    let settings = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'settings')
    assistantScript.onload = () => {
      let options = {
        account: 56997926,
        amount: this.item.payInfo.price,
        transactionId: Date.now(),
        description: `buy item ${this.item.oid} amount:${this.item.payInfo.price}`,
        subscriberId: this.$store.getters.currentUser.oid,
        testMode: 0,
        lang: this.$store.getters.currentUser.profile.lang === LangEnum.RUS ? 'ru' : 'en',
        theme: 'dark',
        customParams: { acquiringSystemName: 'PayAnyWay', itemOid: this.item.oid, price: this.item.payInfo.price, userOid: this.$store.getters.currentUser.oid, apiUrl: settings.services.apiUrl }
      };
      console.log('Assistant', self.Assistant)
      let assistant = new self.Assistant.Builder()
      // платёж прошёл успешно
      assistant.setOnSuccessCallback((operationId, transactionId) => {
        this.$log('payanyway setOnSuccessCallback')
        this.$emit('successPay')
      });

      // платёж не прошёл
      assistant.setOnFailCallback((operationId, transactionId) => {
        // todo: действия на ваш вкус
      });

      // платёж обрабатывается
      assistant.setOnInProgressCallback((operationId, transactionId) => {
        // todo: тоже можно что-нибудь придумать
      });
      assistant.build(options, 'payment-form');
    };
    assistantScript.setAttribute('src', 'https://www.payanyway.ru/assistant-builder')
    document.head.appendChild(assistantScript)
  }
}
</script>
