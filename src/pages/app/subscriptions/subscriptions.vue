<template lang="pug">
.row.full-width.items-start.content-start
  div(
    v-for="(s, ss) in subscriptions" :key="s.id"
    :style=`{height: '150px'}`
    ).row.full-width.justify-center.items-center.bg-white.q-px-md.cursor-pointer.hr
    div(@click="$router.push('/app/user/' + s.oid)").row.items-center
      div(:style=`{width: '30px', height: '30px', backgroundImage: 'url('+ s.thumbUrl +')'}`).subscriptionImage
      //- div(v-show="select").row.items-center
        q-checkbox(v-model="selectIt")
      .row.items-center.justify-center.q-ml-md
        span {{s.name}}
    .col
    div(style=`` v-show="active").row.items-center.q-ml-md
      q-btn(icon="clear" round dense flat color="primary" @click="unSubscribe(s, ss)")
</template>
<script>
export default {
  name: 'subscriptions',
  // props: [ 'active' ],
  data () {
    return {
      subscriptions: [
        {oid: 'AixJG_HBICY=', name: 'Подписка 1', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 2', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 3', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 4', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 5', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 6', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 1', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 2', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 3', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 4', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 8', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 1', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 2', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 3', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 4', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'},
        {oid: '', name: 'Подписка 8', thumbUrl: 'https://test.kalpagramma.com/local_object_storage/thumbs/54/e7/154692406606864399/568.38:6.11-8.57-56.08-62.7_50.jpg'}
      ],
      active: false
    }
  },
  methods: {
    activeDelete () {
      this.active = !this.active
    },
    async unSubscribe (s, ss) {
      try {
        this.$log('unSubscribe start')
        // let { data: { subscriptions } } =
        // let res = await this.$store.dispatch('subscriptions/unSubscribe', s.oid)
        // this.$log('res', res)
        this.$delete(this.subscriptions, ss)
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
