<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: 330+'px'}`).row.full-width
    .row.fit.content-center.items-center
      div().row.full-width
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          q-input(v-model="login" stack-label label="Login" filled).full-width.bg-white
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-sm
          q-input(v-model="password" stack-label label="Password" filled :type="isPwd ? 'password' : 'text'").full-width.bg-white
            template( v-slot:append)
              q-icon(
                :name="isPwd ? 'visibility_off' : 'visibility'"
                size="25px"
                color="black"
                @click="isPwd = !isPwd")
        q-btn(
          push no-caps color="accent" @click="codeSend" :loading="codeSending"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-mb-sm
          span.text-bold {{$t('Login')}}
        q-btn(
          outline no-caps color="white" @click="$go('/login')"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span {{$t('Back')}}
</template>

<script>
 export default {
  name: 'pageLoginSignIn',
  data () {
   return {
     login: '',
     password: '',
     isPwd: true
   }
  },
  methods: {
  },
  mounted () {
   this.$logD('mounted')
  },
  beforeDestroy () {
   this.$logD('beforeDestroy')
  }
 }
</script>
