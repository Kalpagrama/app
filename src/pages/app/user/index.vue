<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  k-dialog-bottom(ref="userSettingsDialog" mode="actions" :options="userSettingsDialogOptions" @action="userSettingsAction")
  div(v-if="user").row.full-width.content-start
    //- header
    div(:style=`{height: '100px'}`).row.full-width.bg-primary
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(round @click="$router.back(1)" flat color="white" icon="arrow_back")
      .col
      .row
        div(style=`height: 60px; width: 60px`).row.items-center.justify-center
          q-btn(round flat @click="$refs.userSettingsDialog.show()" color="white" icon="more_vert")
        //- .row.full-width.justify-end.items-end.q-pb-sm.q-px-sm
          q-btn(@click="" rounded no-caps dense style=`height: 30px` color="grey" icon="").q-px-md Edit profile
    //- body
    div(v-if="true").row.full-width.bg-grey-1.q-px-sm
      .row.full-width
        img(:src="user.thumbUrl" :style=`{width: '80px', height: '80px', marginTop: '-40px', borderRadius: '50%', overflow: 'hidden'}`)
        .col.row.justify-end.q-mt-sm
          q-btn(
            push no-caps
            v-if="myoid !== user.oid"
            @click="mySubscriptions.includes(user.oid) ? followUser(user.oid) : unfollowUser(user.oid)"
            :label="mySubscriptions.includes(user.oid) ? 'Follow' : 'Unfollow'"
            :color="mySubscriptions.includes(user.oid) ? 'accent' : 'red'"
            :style=`{borderRadius: '10px'}`).q-px-md
      .row.full-width.items-center.justify-start
        .row.full-width
          span.text-bold.text-black.text-h6 {{ user.name }}
        .row.full-width
          .row.full-width.q-py-sm
            small.text-grey Status
          //- .row.full-width.q-mt-xs
          //-   small About
        div(v-if="false" @click="showInfo()").row.full-width
          span.text-accent {{text}} detailed information
          //- span {{ user.subscriptions }}
        div(v-if="false && showI").row.full-width.text-grey
          .row.full-width
            span Номер телефона
          .row.full-width
            span Почта
          .row.full-width
            span Язык
          .row.full-width
            span Страна
          .row.full-width
            span Город
          .row.full-width
            span Дата рождения
          .row.full-width
            span Пол
  span {{mySubscriptions}}
  div(
    v-if="user"
    :style=`{position: 'relative', overflow: 'hidden'}`).col.full-width.bg-grey-3
    k-colls(v-if="coll" @coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :style=`{height: '100%'}`).bg-grey-3
      template(v-slot:created)
        k-page
          span Created
      template(v-slot:rated)
        k-page
          span Rated
      template(v-slot:following)
        user-following(:subscriptions="user.subscriptions" :oid="user.oid")
      template(v-slot:followers)
        user-followers(:subscribers="user.subscribers" :oid="user.oid")
</template>

<script>
import userFollowers from './user_followers'
import userFollowing from './user_following'

export default {
  name: 'pageApp__User',
  components: {userFollowing, userFollowers},
  props: ['width', 'height'],
  data () {
    return {
      user: null,
      page: 'nodes',
      showI: false,
      coll: 'created'
    }
  },
  computed: {
    colls () {
      return [
        {id: 'created', name: 'Created'},
        {id: 'rated', name: 'Rated'},
        {id: 'following', name: 'Following ' + this.countSubscriptions},
        {id: 'followers', name: 'Followers ' + this.countSubscribers}
      ]
    },
    myoid () {
      return this.$store.state.user.user.oid
    },
    countSubscribers () {
      if (this.user && this.user.subscribers === null) return 0
      else return this.user.subscribers.length
    },
    countSubscriptions () {
      if (this.user && this.user.subscriptions === null) return 0
      else return this.user.subscriptions.length
    },
    mySubscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    },
    userSettingsDialogOptions () {
      return {
        confirm: false,
        actions: {
          share: {name: 'Share'},
          copy: {name: 'Copy Url'},
          block: {name: 'Block'},
          report: {name: 'Report', color: 'red'}
        }
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$logD('$route CHANGED', to)
        if (to.params.oid) {
          this.$logD('GOT USER OID', to.params.oid)
          this.user = await this.userLoad(to.params.oid)
          this.page = 'nodes'
        } else {
          this.$logD('NO USER OID!')
          this.$router.push({params: {oid: this.$store.state.auth.user.oid}})
        }
      }
    }
  },
  methods: {
    userSettingsAction (a) {
      this.$logD('userSettingsAction', a)
      switch (a) {
        case 'report': {
          break
        }
        case 'block': {
          break
        }
        case 'copy': {
          break
        }
        case 'share': {
          break
        }
      }
    },
    async followUser () {
       try {
        this.$logD('subcribe start')
        let res = await this.$store.dispatch('subscriptions/subscribe', this.user.oid)
        this.$logD('res', res)
        this.$logD('subcribe done')
      } catch (error) {
        this.$logD('subcribe error', error)
      }
    },
    async unfollowUser () {
      try {
        this.$logD('subDelete start')
        let res = await this.$store.dispatch('subscriptions/unSubscribe', this.user.oid)
        this.$logD('res', res)
        // this.$delete(this.userSubscriptions, ss)
        this.$logD('subDelete done')
      } catch (error) {
        this.$logD('subDelete error', error)
      }
    },
    async userLoad (oid) {
      this.$logD('userLoad start')
      let user = await this.$store.dispatch('objects/get', { oid, fragmentName: 'userFragment', priority: 0 })
      this.$logD('userLoad done', user)
      return user
    },
    avatarError (e) {
      // this.$logD('avatarError', e)
      e.target.src = 'statics/logo.png'
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
