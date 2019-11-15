<template lang="pug">
  .row.fit.items-center.content-center.justify-center
    //- .row.full-width.justify-center
    //-   q-icon(name="add" size="45px")
    .row.full-width.items-center.justify-center
      q-icon(name="fab fa-vk" size="100px" style="color: #45668e")
    //- .row.full-width.justify-center
    //-   span(style=`fontSize: 45px`) =
    //- .row.full-width.items-center.justify-center
    //-   span(style=`fontSize: 100px`) 💘
</template>

<script>
 export default {
  name: 'pageLogin__Vk',
  data () {
   return {}
  },
  computed: {
   getUrl () {
    let state = JSON.stringify({origin: window.location.origin, inviteCode: localStorage.getItem('ktokenInviteCode')})
    return this.$store.state.auth.AUTH_VK.url + `&state=${state}`
   }
  },
  async mounted () {
   this.$log('mounted')
   await this.$wait(500)
   location.href = this.getUrl
  }
 }
</script>
