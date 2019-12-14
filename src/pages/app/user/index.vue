<style lang="stylus">
.q-footer {
  background: none !important
}
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf").bg-grey-3
  k-dialog-bottom(ref="userSettingsDialog" mode="actions" :options="userSettingsDialogOptions" @action="userSettingsAction")
  k-dialog-bottom(ref="userPhotoDialog" mode="actions" :options="userPhotoDialogOptions" @action="userPhotoAction")
  input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
  q-header.row.full-width.justify-center
    div(:style=`{maxWidth: '500px'}`).row.full-width
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
        div(v-if="true").row.full-width.q-px-sm
          //- <input type="file" @change="previewFiles" multiple>
          .row.full-width
            img(:src="user.thumbUrl" @click="$refs.userPhotoDialog.show()"
              :style=`{width: '80px', height: '80px', marginTop: '-40px', borderRadius: '50%', overflow: 'hidden'}`).bg-grey-2
            div(v-if="myoid !== user.oid ").col.row.justify-end.q-mt-sm
              q-btn(
                rounded no-caps
                @click="include ? unfollowUser(user.oid) : followUser(user.oid)"
                :label="include ? 'Unfollow' : 'Follow'"
                :color="include ? 'red' : 'accent'"
                ).q-px-md
          .row.full-width.items-center.justify-start
            .row.full-width
              span.text-bold.text-h6.text-white {{ user.name }}
            .row.full-width
              .row.full-width.q-py-sm
                small.text-grey Status
              //- .row.full-width.q-mt-xs
              //-   small About
            div(v-if="false" @click="showInfo()").row.full-width
              span.text-accent Show detailed information
              //- span {{ user.subscriptions }}
  q-page-container
    .row.full-width.justify-center
      div(:style=`{maxWidth: '500px'}`).row.full-width
        div(
          v-if="user"
          :style=`{position: 'relative', height: '100vh', overflow: 'hidden'}`).col.full-width.bg-grey-3
          k-colls(v-if="coll" @coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :style=`{height: '100vh'}`).bg-grey-3
            template(v-slot:created)
              user-created-nodes()
            template(v-slot:rated)
              user-created-nodes()
            template(v-slot:following)
              user-following(:subscriptions="user.subscriptions" :oid="user.oid")
            template(v-slot:followers)
              user-followers(:subscribers="user.subscribers" :oid="user.oid")
  q-footer.row.full-width.justify-center
    k-menu-mobile(:style=`{maxWidth: '500px'}`)
</template>

<script>
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreatedNodes from './user_created_nodes'
import userRatedNodes from './user_rated_nodes'

export default {
  name: 'pageApp__User',
  components: {userRatedNodes, userCreatedNodes, userFollowing, userFollowers},
  props: ['width', 'height'],
  data () {
    return {
      user: null,
      page: 'nodes',
      showI: false,
      coll: 'created',
      theStream: '',
      file: null
    }
  },
  computed: {
    include () {
      let find = this.mySubscriptions.find(s => s.oid === this.user.oid)
      if (find) return true
      else return false
    },
    colls () {
      return [
        {id: 'created', name: 'Created'},
        {id: 'rated', name: 'Rated'},
        {id: 'following', name: this.countSubscriptions + ' Following'},
        {id: 'followers', name: this.countSubscribers + ' Followers'}
      ]
    },
    myoid () {
      return this.$store.state.objects.currentUser.oid
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
    },
    userPhotoDialogOptions () {
      return {
        confirm: false,
        actions: {
          // makePhoto: {name: 'Make a photo'},
          download: {name: 'Download from device'}
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
          this.$router.push({params: {oid: this.$store.state.objects.currentUser.oid}})
        }
      }
    }
  },
  methods: {
    fileChanged (e) {
      this.$log(e.target.files)
      this.file = e.target.files
      this.downloadPhoto()
    },
    userPhotoAction (a) {
      this.$logD('userPhotoAction', a)
      switch (a) {
        // case 'makePhoto': {
        //   break
        // }
        case 'download': {
          this.$refs.fileInput.click()
          break
        }
      }
    },
    async downloadPhoto (e) {
      try {
        this.$log('changePhoto start')
        let res = await this.$store.dispatch('objects/setPhoto', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'thumbUrl',
          value: this.file
        })
      } catch (e) {
        this.$log('changePhoto ERROR', e)
      }
    },
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
        this.user = await this.userLoad(this.$route.params.oid)
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
        this.user = await this.userLoad(this.$route.params.oid)
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
