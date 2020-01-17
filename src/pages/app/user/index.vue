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
q-layout(view="hHh lpR fFf").bg-grey-3
  k-dialog-bottom(ref="userSettingsDialog" mode="actions" :options="userSettingsDialogOptions" @action="userSettingsAction")
  k-dialog-bottom(ref="userPhotoDialog" mode="actions" :options="userPhotoDialogOptions" @action="userPhotoAction")
  input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
  q-header(reveal).row.full-width.justify-center
    div(
      v-if="user"
      :style=`{minHeight: '60px', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.bg-primary
      //- div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      //-   q-btn(round @click="$router.back(1)" flat color="white" icon="arrow_back")
      .col
        .row.full-width.justify-start.items-center.fit.q-px-sm
          span(:style=`{fontSize: '16px'}`).text-bold.text-white {{ user.name }}
      .row
        div(style=`height: 60px; width: 60px`).row.items-center.justify-center
          q-btn(v-if="!editions" round flat @click="$refs.userSettingsDialog.show()" color="white" icon="more_vert")
          q-btn(v-else round flat @click="save()" color="white" icon="done")
      .row.full-width.q-pa-sm.bg-primary
        span(
          v-for="(p, pi) in pages" :key="pi" @click="pageId = p"
          :style=`{position: 'relative', borderRadius: '10px'}` v-ripple=`{color: 'white'}`
          :class="{'bg-green': p === pageId}"
          ).text-bold.q-pa-sm.q-mr-md.cursor-pointer.hr {{ p }}
  q-page-container.row.full-width.justify-center
    div(v-if="user").row.full-width.items-start.content-start.justify-center.bg-primary
        //- header
        //- div(:style=`{height: '60px', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        //-   div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        //-     q-btn(round @click="$router.back(1)" flat color="white" icon="arrow_back")
        //-   .col
        //-   .row
        //-     div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        //-       q-btn(v-if="!editions" round flat @click="$refs.userSettingsDialog.show()" color="white" icon="more_vert")
        //-       q-btn(v-else round flat @click="save()" color="white" icon="done")
            //- .row.full-width.justify-end.items-end.q-pb-sm.q-px-sm
              q-btn(@click="" rounded no-caps dense style=`height: 30px` color="grey" icon="").q-px-md Edit profile
        //- body
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-sm.q-py-lg.bg-primary
          //- <input type="file" @change="previewFiles" multiple>
          .row.full-width
            img(:src="user.profile.thumbUrl" @click="changePhoto()"
              :style=`{width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden'}`)
            div(v-if="myoid !== user.oid ").col.row.justify-end.q-mt-sm
              q-btn(
                rounded no-caps
                @click="include ? unfollowUser(user.oid) : followUser(user.oid)"
                :label="include ? $t('Unfollow') : $t('Follow')"
                :color="include ? 'red' : 'accent'"
                style=`height: 40px`
                ).q-px-md
          //- .row.full-width.items-center.justify-start
          //-   .row.full-width
          //-     span.text-bold.text-h6.text-white {{ user.name }}
          //-   div(v-if="!editions").row.full-width
          //-     .row.full-width
          //-       span.text-grey-4 {{status}}
          //-     .row.full-width.q-mb-sm
          //-       span.text-grey {{about}}
          //-   div(v-if="editions").row.full-width
          //-     input(v-model="status" placeholder="Status").full-width.text-white.q-mb-sm
          //-     input(v-model="about" placeholder="About").full-width.text-white.q-mb-sm
          //-     //- .row.full-width.q-mt-xs
          //-     //-   small About
          //-   div(v-if="false" @click="showInfo()").row.full-width
          //-     span.text-accent Show detailed information
          //-     //- span {{ user.subscriptions }}
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-md
        user-created-nodes(
          v-if="pageId === 'Created nodes'"
          :filter="{ types: ['NODE'], fastFilters: ['CREATED_BY_USER']}")
        user-created-nodes(
          v-if="pageId === 'Voted nodes'"
          :filter="{ types: ['NODE'], fastFilters: ['VOTED_BY_USER']}")
        user-following(
          v-if="pageId === 'Following'"
          :subscriptions="user.subscriptions" :oid="user.oid")
        user-followers(
          v-if="pageId === 'Followers'"
          :subscribers="user.subscribers" :oid="user.oid")
  q-footer.row.full-width.justify-center
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
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
      file: null,
      editions: false,
      status: null,
      about: null,
      pageId: 'Created nodes',
      pages: ['Created nodes', 'Voted nodes', 'Following', 'Followers']
    }
  },
  computed: {
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
          share: {name: 'Share'},
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
        this.$logD('$route CHANGED', to)
        if (to.params.oid) {
          this.$logD('GOT USER OID', to.params.oid)
          this.user = await this.userLoad(to.params.oid)
          this.page = 'nodes'
          this.status = this.user.profile.status
          this.about = this.user.profile.about
          this.pageId = 'Created nodes'
        } else {
          this.$logD('NO USER OID!')
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
            value: this.about
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
            value: this.status
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
          path: 'profile.thumbUrl',
          value: file
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
        case 'edit': {
          this.editions = !this.editions
          break
        }
        case 'changePhoto': {
          this.changePhoto()
          break
        }
      }
    },
    async followUser () {
       try {
        this.$logD('subcribe start')
        let res = await this.$store.dispatch('user/subscribe', this.user.oid)
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
        let res = await this.$store.dispatch('user/unSubscribe', this.user.oid)
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
    this.$logD('mounted')
    this.$q.addressbarColor.set('#101d49')
    document.body.style.background = '#101d49'
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
