<template lang="pug">
user-explorer(v-if="user" :user="user" :loading="userLoading")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp-user',
  data () {
    return {
      user: null,
      userLoading: false,
      userLoadingError: null
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid CHANGED', to)
        if (to) {
          this.user = await this.userLoad(to)
        }
        else {
          // this.$router.replace({params: {oid: this.$store.getters.currentUser().oid}})
        }
      }
    },
  },
  methods: {
    async userLoad (oid) {
      try {
        this.$log('userLoad start', oid)
        this.userLoading = true
        let user = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
        this.$log('userLoad user', user)
        this.userLoading = false
        this.userLoadingError = null
        this.$log('userLoad done')
        return user
      }
      catch (e) {
        this.$log('userLoad error', e)
        this.user = null
        this.userLoading = false
        this.userLoadingError = e
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
