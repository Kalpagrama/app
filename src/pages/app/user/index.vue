<style lang="stylus">
.q-footer {
  background: none !important
}
input {
  background-color: transparent;
  border: 0px solid;
  height: 20px;
  width: 160px;
}
input:focus,
select:focus,
textarea:focus,
button:focus {
    outline: none;
}
::placeholder {
  opacity: 1;
  color: grey
}
</style>
<template lang="pug">
q-layout(
  view="hhh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  q-header(
    v-if="false"
    reveal
    :style=`{zIndex: 200, paddingLeft: $q.screen.xs ? '0px' : '60px'}`).row.full-width.justify-center.bg-grey-9
    div(
      v-if="user"
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`
      ).row.full-width.items-center.content-center.justify-start.q-px-sm
      span.text-bold.text-white {{ user.name }}
      .row.full-width
        small.text-white @{{ user.name }}
  q-page-container.row.fit.justify-center.bg-grey-10
    //- user-info(v-if="user" :user="user" :page="page" @page="page = $event")
    user-created-nodes(
      v-if="page === 'created'"
      :filter="{ types: ['NODE'], fastFilters: ['CREATED_BY_USER']}")
      template(v-slot:header)
        user-info(v-if="user" :user="user" :page="page" @page="page = $event")
    user-voted-nodes(
      v-if="page === 'voted'"
      :filter="{ types: ['NODE'], fastFilters: ['VOTED_BY_USER']}")
      template(v-slot:header)
        user-info(v-if="user" :user="user" :page="page" @page="page = $event")
    user-following(
      v-if="page === 'following'"
      :subscriptions="user.subscriptions" :oid="user.oid")
      template(v-slot:header)
        user-info(v-if="user" :user="user" :page="page" @page="page = $event")
    user-followers(
      v-if="page === 'followers'"
      :subscribers="user.subscribers" :oid="user.oid")
      template(v-slot:header)
        user-info(v-if="user" :user="user" :page="page" @page="page = $event")
</template>

<script>
import userInfo from './user_info'
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreatedNodes from './user_created_nodes'
import userVotedNodes from './user_voted_nodes'

export default {
  name: 'pageApp__User',
  components: {userInfo, userVotedNodes, userCreatedNodes, userFollowing, userFollowers},
  props: ['width', 'height'],
  data () {
    return {
      user: null,
      page: 'created',
      showI: false,
      theStream: '',
      file: null,
      editions: false,
      status: null,
      about: null
    }
  },
  computed: {
    colorButton () {
      if (this.pageId === 'Created nodes') return 'bg-green'
      else return 'bg-white'
    },
    scroll () {
      if (window.scrollY > 100) return true
      else return false
    },
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
      return this.$store.getters.currentUser.oid
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
      return this.$store.getters.currentUser.subscriptions
    },
    userSettingsDialogOptions () {
      let options = {
        confirm: false,
        actions: {
          copy: {name: 'Copy Url'}
        }
      }
      if (this.$route.params.oid === this.myoid) {
        options.actions = {
          ...options.actions,
          edit: {name: 'Edit'},
          changePhoto: {name: 'Change photo'},
        }
      } else {
        options.actions = {
          ...options.actions,
          block: {name: 'Block'},
          report: {name: 'Report', color: 'red'}
        }
      }
      return options
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
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.user = await this.userLoad(to.params.oid)
        }
        else {
          this.$log('NO USER OID!')
          this.$router.push({params: {oid: this.$store.getters.currentUser.oid}})
        }
      }
    }
  },
  methods: {
    save () {
      this.changeStatus()
      this.changeAbout()
      this.editions = !this.editions
    },
    async changeAbout () {
      if (this.about !== this.currentAbout) {
        try {
          this.$log('changeAbout start')
          let res = await this.$store.dispatch('objects/update', {
            oid: this.$store.getters.currentUser.oid,
            path: 'profile.about',
            newValue: this.about
          })
          this.$log('changeAbout done', res)
        } catch (e) {
          this.$log('changeAbout ERROR', this.about)
        }
      }
    },
    async changeStatus () {
      if (this.status !== this.currentStatus) {
        try {
          this.$log('changeStatus start')
          let res = await this.$store.dispatch('objects/update', {
            oid: this.$store.getters.currentUser.oid,
            path: 'profile.status',
            newValue: this.status
          })
          this.$log('changeStatus done', res)
        } catch (e) {
          this.$log('changeStatus ERROR', this.status)
        }
      }
    },
    changePhoto () {
      if (this.myoid === this.user.oid) {
        this.$refs.userPhotoDialog.show()
      }
    },
    fileChanged (e) {
      this.$log(e.target.files)
      if (e.target.files.length === 1){
        this.file = e.target.files[0]
        this.downloadPhoto(this.file)
      } else throw new Error(`bad selected files len ${e.target.files.length}`)
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
    async downloadPhoto (file) {
      try {
        this.$log('changePhoto start')
        let res = await this.$store.dispatch('objects/update', {
          oid: this.$store.getters.currentUser.oid,
          path: 'profile.photo',
          newValue: file
        })
      } catch (e) {
        this.$log('changePhoto ERROR', e)
      }
    },
    async userLoad (oid) {
      this.$log('userLoad start')
      let user = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('userLoad done', user)
      return user
    }
  },
  mounted () {
    this.$logD('mounted')
    this.$q.addressbarColor.set('#101d49')
    document.body.style.background = '#101d49'
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
