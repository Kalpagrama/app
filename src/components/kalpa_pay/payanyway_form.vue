<template lang="pug">
  div(:style=`{
               border: "grey",
               borderStyle: 'solid',
               borderWidth: '2px',
               borderRadius: '15px',
               overflow: 'hidden',
      }`)
    //q-btn(label="test").text-white
    div(id="payment-form")
</template>

<script>

export default {
  name: 'payanywayForm',
  data () {
    return {}
  },
  props: ['amount', 'transactionId', 'description', 'subscriberId'],
  methods: {},
  mounted () {
    let assistantScript = document.createElement('script')
    assistantScript.onload = () => {
      let options = {
        account: 56997926,
        amount: this.amount,
        transactionId: this.transactionId,
        description: this.description,
        subscriberId: this.subscriberId,
        testMode: 0,
        lang: 'ru',
        theme: 'dark',
        customParams: { book: 'oid', anyparam: 'anyvalue' }
      };
      console.log('Assistant', self.Assistant)
      let assistant = new self.Assistant.Builder()
      // платёж прошёл успешно
      assistant.setOnSuccessCallback((operationId, transactionId) => {
        this.$log('payanyway setOnSuccessCallback')
        this.$emit('success')
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
