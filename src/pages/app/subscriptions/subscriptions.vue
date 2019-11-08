<template lang="pug">
.row.full-width.justify-center
    //- body
    div(
      v-for="(s, ss) in userSubscriptions" :key="s.id"
      :style=`{height: '50px'}`
      ).row.full-width.justify-center.items-center.bg-white.q-px-md.cursor-pointer.hr
      div(@click="pageSubscriber(s)").row.items-center
        div(:style=`{width: '30px', height: '30px', backgroundImage: 'url('+ s.thumbUrl +')'}`).subscriptionImage
        .row.items-center.justify-center.q-ml-md
          span {{s.name | cut(10)}}
      .col
      div(v-show="active").row.items-center.q-ml-md
        q-btn(icon="clear" round dense flat color="primary" @click="unSubscribe(s, ss)")
    div(v-if="userSubscriptions.length === 0" :style=`{ height: '100px', borderRadius: '0 0 10px 10px'}`).row.full-width.justify-center.q-px-md.items-center.bg-white
      span.text-center.text-bold У вас пока нету активных подписок.
</template>
<script>
export default {
  name: 'subscriptions',
  props: [ 'width', 'height' ],
  data () {
    return {
      active: false
    }
  },
  computed: {
    userSubscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    }
  },
  methods: {
    async pageSubscriber (s) {
      this.$log('pageClick', s)
      let path = ''
      switch (s.type) {
        case 'chain': {
          path = '/app/chain/' + s.oid
          break
        }
        case 'user': {
          path = '/app/user/' + s.oid
          break
        }
        case 'sphere': {
          path = '/app/sphere/' + s.oid
          break
        }
        case 'content': {
          path = '/app/content/' + s.oid
          break
        }
      }
      this.$router.push(path)
    },
    activeDelete () {
      this.active = !this.active
    },
    async unSubscribe (s, ss) {
      try {
        this.$log('unSubscribe start')
        let res = await this.$store.dispatch('subscriptions/unSubscribe', s.oid)
        this.$log('res', res)
        this.$delete(this.userSubscriptions, ss)
        this.$log('unSubscribe done')
      } catch (error) {
        this.$log('unSubscribe error', error)
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.subscriptionImage
  background-repeat: no-repeat
  background-size: cover;
  background-position: center
  border-radius: 20px;
</style>
