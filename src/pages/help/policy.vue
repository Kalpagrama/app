<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.maxWidthPage+'px',
      borderRadius: '10px',
      marginBottom: $q.screen.height/2+'px'
    }`
    ).row.full-width.q-pa-md
    .row.full-width.q-py-sm
      span.text-green.text-bold Privacy policy
    .row.full-width.text-white
      p Data protection is of a particularly high priority for the management of kalpa.app. When the processing of your personal data is necessary and if there is no basis for such processing, we will obtain your consent.
      p Processing of personal data, including your name, address, email address, or phone number will always be in line with the General Data Protection Regulation (GDPR), and in accordance with other data protection regulations applicable to kalpa.app.
      p Via this data protection declaration, we are informing the general public of the nature, scope, and purpose of the personal data we collect, use, and process. Furthermore, you are informed, by this data protection declaration, of the rights to which you are entitled.
      p As the data controller and data processor, kalpa.app has implemented numerous technical and organizational measures to ensure complete protection of your personal data throughout the website. Since Internet-based data transmissions may have security gaps, absolute protection is not guaranteed. This is why every data subject is free to transfer personal data to us via all available means, e.g. by email or phone support.
</template>

<script>
export default {
  name: 'pageHelpPolicy',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
